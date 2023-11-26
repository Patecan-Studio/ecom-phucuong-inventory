import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { ProductModel } from './models/product.model'
import { CategoryModel } from './models/category.model'
import { Product, ProductVariantStatus } from '../domain'
import slugify from 'slugify'
import { BrandModel } from './models/brand.model'
import { CategoryNotFoundException } from '../errors/category.errors'
import { BrandNotFoundException } from '../errors/brand.errors'
import { DuplicateProductNameException } from '../errors/product.errors'
import { ProductVariant } from '../domain/product-variant'
import { IPaginationResult, Utils } from '@libs'
import { ProductMaterial, ProductMaterialModel } from './models/material.model'
import mongoose, { Connection } from 'mongoose'
import {
	BaseRepository,
	DATABASE_CONNECTION,
	MongoDBErrorHandler,
} from '@infras/mongoose'

@Injectable()
export class ProductRepository extends BaseRepository {
	private readonly logger = new Logger(ProductRepository.name)

	constructor(
		@Inject(DATABASE_CONNECTION)
		connection: Connection,
		@Optional()
		sessionId?: string,
	) {
		super(connection, sessionId)
	}

	genId() {
		return new mongoose.Types.ObjectId().toHexString()
	}

	async save(product: Product, isNew = true): Promise<Product> {
		const raw = product.serialize()
		const [categoryList, brand] = await Promise.all([
			CategoryModel.find()
				.where({
					_id: {
						$in: raw.product_categories,
					},
					isMarkedDelete: false,
				})
				.select('category_name category_logoUrl')
				.exec(),
			BrandModel.findById(raw.product_brand)
				.select('brand_name brand_logoUrl')
				.exec(),
		])
		if (categoryList.length < raw.product_categories.length) {
			const missingCategoryIds = raw.product_categories.filter(
				(categoryId) =>
					!categoryList.some((category) =>
						category._id.equals(categoryId),
					),
			)
			throw new CategoryNotFoundException(missingCategoryIds)
		}
		if (!brand) {
			throw new BrandNotFoundException(raw.product_brand)
		}
		const model = new ProductModel({
			product_slug: slugify(raw.product_name, {
				lower: true,
			}),
			product_name: raw.product_name,
			product_description: raw.product_description,
			product_banner_image: raw.product_banner_image,
			product_brand: brand.toObject({}),
			product_categories: categoryList.map((cate) => cate.toObject()),
			product_variant_list: raw.product_variants,
			product_status: raw.product_status,
			product_variants: raw.product_variants,
			product_warranty: raw.product_warranty,
			product_isActive: true,
			isMarkedDelete: false,
		})
		model.id = raw._id ?? new mongoose.Types.ObjectId()
		model.isNew = isNew
		try {
			const result = await model.save({
				session: this.session,
			})
			const materialList = result.product_variants
				.map((variant) => {
					const materialProperty = variant.property_list.find(
						(prop) => prop.name === 'material',
					)
					if (materialProperty) {
						return {
							material_name: materialProperty.value,
						}
					}
					return null
				})
				.filter((material) => !!material)
			await this.batchSaveMaterials(materialList)

			product.setId(result._id.toString())

			return product
		} catch (error) {
			this.logger.error(error)
			if (
				MongoDBErrorHandler.isDuplicatedKeyError(error, 'product_name')
			) {
				throw new DuplicateProductNameException(raw.product_name)
			}
			throw error
		}
	}

	async getProductById(id: string): Promise<Product> {
		const product = await ProductModel.findById(id).exec()
		if (!product) {
			return null
		}
		const raw = product.toObject({
			versionKey: false,
			depopulate: true,
		})
		return new Product({
			...raw,
			product_variants: raw.product_variants.map(
				(variant) => new ProductVariant(variant as any),
			),
		} as any)
	}

	async queryById(id: string) {
		const product = await ProductModel.findById(id)
			.where({
				isMarkedDelete: false,
			})
			.select(this.getSelectFields())
			.exec()

		if (!product) {
			return null
		}

		return this.mapProduct(
			product.toObject({
				versionKey: false,
				depopulate: true,
				flattenObjectIds: true,
			}),
		)
	}

	async deleteProductById(id: string) {
		const product = await ProductModel.findById(id).exec()
		if (!product) {
			return null
		}

		product.product_name = `${product.product_name}_${Date.now()}`
		product.isMarkedDelete = true
		product.product_categories = []
		product.product_brand = null

		return await product.save()
	}

	async searchProductsByKeyword(options: {
		keyword: string
		page: number
		page_size: number
	}): Promise<IPaginationResult> {
		const { keyword, page, page_size } = options

		const query: any = {
			isMarkedDelete: false,
		}
		if (keyword) {
			const escapedKeyword = Utils.escapeRegExp(keyword)
			const regexSearch: RegExp = new RegExp(escapedKeyword, 'i') // 'i' for case-insensitive search
			query.$text = { $search: regexSearch.source }
		}

		const findProductsQuery = ProductModel.find(query)
			.select('-__v')
			.sort({
				createdAt: -1,
			})
			.skip((page - 1) * page_size)
			.limit(page_size)

		keyword && findProductsQuery.where({ $text: { $search: keyword } })

		const [results, totalCount] = await Promise.all([
			findProductsQuery.select(this.getSelectFields()).exec(),
			ProductModel.countDocuments(query),
		])

		return {
			items: results.map((product) =>
				this.mapProduct(
					product.toObject({
						flattenObjectIds: true,
					}),
				),
			),
			page: page,
			page_size: page_size,
			total_page: Math.ceil(totalCount / page_size),
			total_count: totalCount,
		}
	}

	async batchSaveMaterials(
		materials: Omit<ProductMaterial, '_id'>[],
	): Promise<void> {
		const materialRawList = materials.map(
			(material) =>
				new ProductMaterialModel({
					_id: new mongoose.Types.ObjectId(),
					...material,
				}),
		)
		try {
			// Notes: We're ok with material save action being failed due to duplicate key. So we don't use session here
			// in order to not trigger aborting the whole session.
			await Promise.all(
				materialRawList.map((material) => material.save()),
			)
		} catch (error) {
			this.logger.warn(error)
		}
	}

	async findMaterials(options: {
		material_name: string
		page: number
		page_size: number
	}): Promise<{
		items: ProductMaterial[]
		page_size: number
		page: number
		total_page: number
		total_count: number
	}> {
		const { page = 1, page_size = 10, material_name } = options
		const filter = {
			isMarkedDelete: false,
			...(material_name && {
				$text: { $search: material_name },
			}),
		}
		const [categoryList, count] = await Promise.all([
			ProductMaterialModel.find(filter)
				.select('-__v -isMarkedDelete')
				.skip((page - 1) * page_size)
				.limit(page_size)
				.exec(),
			ProductMaterialModel.countDocuments(filter),
		])

		return {
			items: categoryList.map((cat) =>
				cat.toObject({
					flattenObjectIds: true,
				}),
			),
			page: page,
			page_size: page_size,
			total_page: Math.ceil(count / page_size),
			total_count: count,
		}
	}

	protected clone(sessionId: string) {
		return new ProductRepository(this.connection, sessionId)
	}

	private mapProduct(product: any): any {
		product.product_variants.forEach((variant) => {
			variant.status ||= ProductVariantStatus.Active
		})
		return product
	}

	private getSelectFields() {
		return '-isMarkedDelete -product_isActive'
	}
}
