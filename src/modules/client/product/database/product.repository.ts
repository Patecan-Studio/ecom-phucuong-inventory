import { Injectable } from '@nestjs/common'
import { ProductModel } from './models/product.model'
import { IPaginationResult, Utils } from '@libs'
import { ProductStatus } from '../constants'

@Injectable()
export class ProductRepository {
	async searchProductsByKeyword(options: {
		keyword: string
		page: number
		page_size: number
	}): Promise<IPaginationResult> {
		const { keyword, page, page_size } = options
		const query: Record<string, any> = {
			isMarkedDelete: false,
			product_status: ProductStatus.Published,
		}
		if (keyword) {
			const escapedKeyword = Utils.escapeRegExp(keyword)
			const regexSearch: RegExp = new RegExp(escapedKeyword, 'i') // 'i' for case-insensitive search
			query.$text = { $search: regexSearch.source }
		}

		const findProductsQuery = ProductModel.find(query)
			.select(this.getSelectFields())
			.skip((page - 1) * page_size)
			.limit(page_size)

		keyword && findProductsQuery.where({ $text: { $search: keyword } })

		const [results, totalCount] = await Promise.all([
			findProductsQuery.exec(),
			ProductModel.countDocuments(query),
		])

		return {
			items: results.map((product) =>
				product.toObject({
					flattenObjectIds: true,
				}),
			),
			page: page,
			page_size: page_size,
			total_page: Math.ceil(totalCount / page_size),
			total_count: totalCount,
		}
	}

	async find(options: {
		page: number
		page_size: number
		category: string
		brand: string
		priceMin: number
		priceMax: number
		filters: Record<string, any>
	}): Promise<IPaginationResult> {
		const {
			page = 1,
			page_size = 10,
			category,
			brand,
			priceMin,
			priceMax,
			filters,
		} = options
		const query = {
			isMarkedDelete: false, // Default filter
			product_status: ProductStatus.Published,
			...filters, // Additional filter options
		}

		if (category) {
			if (category.toLowerCase().trim() !== 'all') {
				query['product_categories._id'] = category
			}
		}
		if (brand) {
			query['product_brand._id'] = brand
		}

		const [productsList, count] = await Promise.all([
			ProductModel.find(query)
				.select(this.getSelectFields())
				.skip((page - 1) * page_size)
				.limit(page_size)
				.exec(),

			ProductModel.countDocuments({ isMarkedDelete: false }),
		])

		return {
			items: productsList.map((product) =>
				product.toObject({
					flattenObjectIds: true,
				}),
			),
			page: page,
			page_size: page_size,
			total_page: Math.ceil(count / page_size),
			total_count: count,
		}
	}

	async findByCategoryId(
		categoryId: string,
		options: {
			page: number
			page_size: number
			filters: Record<string, any>
		},
	): Promise<IPaginationResult> {
		const { page = 1, page_size = 10, filters } = options
		const query = {
			'product_categories._id':
				Utils.convertStringIdToObjectId(categoryId),
			isMarkedDelete: false, // Default filter
			...filters, // Additional filter options
		}

		const [productsList, count] = await Promise.all([
			ProductModel.find(query)
				.select('-__v -isMarkedDelete')
				.skip((page - 1) * page_size)
				.limit(page_size)
				.exec(),

			ProductModel.countDocuments(query),
		])

		return {
			items: productsList.map((product) =>
				product.toObject({
					flattenObjectIds: true,
				}),
			),
			page: page,
			page_size: page_size,
			total_page: Math.ceil(count / page_size),
			total_count: count,
		}
	}

	async getById(id: string) {
		const result = await ProductModel.findById(id)
			.where({
				isMarkedDelete: false,
				product_status: ProductStatus.Published,
			})
			.select('-__v -isMarkedDelete')

		if (!result) {
			return null
		}

		return result.toObject({
			flattenObjectIds: true,
		})
	}

	async getBySlug(slug: string) {
		const result = await ProductModel.findOne()
			.where({
				product_slug: slug,
				isMarkedDelete: false,
				product_status: ProductStatus.Published,
			})
			.select(this.getSelectFields())
			.exec()

		if (!result) {
			return null
		}

		return result.toObject({
			flattenObjectIds: true,
		})
	}

	private getSelectFields() {
		return '-__v -isMarkedDelete -category_products -createdAt -updatedAt -product_isActive -product_status'
	}
}
