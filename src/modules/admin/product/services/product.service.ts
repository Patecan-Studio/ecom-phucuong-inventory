import { Inject, Injectable, Logger } from '@nestjs/common'
import { CategoryRepository, ProductRepository } from '../database'
import { CreateProductDTO, Product, UpdateProductDTO } from '../domain'
import { CategoryNotFoundException } from '../errors/category.errors'
import { UpdateCategoryDTO } from './dtos/update-category.dto'
import { CreateCategoryDTO } from './dtos/create-category.dto'
import { ProductNotFoundException } from '../errors/product.errors'
import { InventoryService } from '@modules/admin/inventory'
import { PRODUCT_MODULE_CONFIG } from '../constants'
import { ProductModuleConfig } from '../interfaces'
import { ImageUploader } from '@modules/admin/image-uploader'
import { randomInt } from 'crypto'

@Injectable()
export class ProductService {
	private readonly logger = new Logger(ProductService.name)
	constructor(
		@Inject(PRODUCT_MODULE_CONFIG)
		private readonly config: ProductModuleConfig,
		private readonly imageUploader: ImageUploader,
		private readonly productRepo: ProductRepository,
		private readonly categoryRepo: CategoryRepository,
		private readonly inventoryService: InventoryService,
	) {}

	async createProduct(dto: CreateProductDTO) {
		dto._id = this.productRepo.genId()

		await this.updateProductImage(dto._id, dto)
		const product = Product.createProduct(dto)

		const productRepo =
			await this.productRepo.startTransaction<ProductRepository>()
		try {
			const newProduct = await productRepo.save(product)

			await this.inventoryService.createInventories(
				product,
				productRepo.sessionId,
			)

			await productRepo.commitTransaction()

			return newProduct
		} catch (error) {
			this.logger.error(error)
			await productRepo.abortTransaction()
			this.removeProductImage(dto._id)
			throw error
		}
	}

	async updateProduct(productId: string, dto: UpdateProductDTO) {
		const product = await this.productRepo.getProductById(productId)
		if (!product) {
			throw new ProductNotFoundException(productId)
		}

		// NOTES: Disable removing product image when update product to avoid conflict issue. It is better to handle by CRON instead
		// await this.removeProductImage(productId)
		await this.updateProductImage(productId, dto)

		product.update(dto)

		const productRepo =
			await this.productRepo.startTransaction<ProductRepository>()

		try {
			const updatedProduct = await productRepo.save(product, false)

			await this.inventoryService.updateInventoriesOfProduct(
				product,
				productRepo.sessionId,
			)

			await productRepo.commitTransaction()

			return updatedProduct
		} catch (error) {
			this.logger.error(error)
			await productRepo.abortTransaction()
			throw error
		}
	}

	async deleteProduct(productId: string) {
		const result = await this.productRepo.deleteProductById(productId)
		return result
	}

	async getCategoryById(categoryId: string): Promise<any> {
		const category = await this.categoryRepo.getById(categoryId)
		if (!category) {
			throw new CategoryNotFoundException(categoryId)
		}
		return category
	}

	async updateCategory(dto: UpdateCategoryDTO): Promise<any> {
		const category = await this.categoryRepo.getById(dto._id)
		if (!category) {
			throw new CategoryNotFoundException(dto._id)
		}

		await this.updateCategoryImage(category._id, dto)

		category.category_name = dto.category_name
		category.category_description = dto.category_description
		category.category_logoUrl = dto.category_logoUrl
		category.category_images = dto.category_images

		const result = await this.categoryRepo.update(category)

		return result
	}

	private async updateCategoryImage(
		categoryId: string,
		dto: CreateCategoryDTO | UpdateCategoryDTO,
	) {
		const results = await Promise.allSettled(
			dto.category_images.map(async (image) => {
				const newImageUrl = await this.imageUploader.copyFromTempTo(
					image.imageUrl,
					`${this.config.basePaths.category}/${categoryId}/${image.imageName}`,
				)
				image.imageUrl = newImageUrl
			}),
		)

		const failedResults = results.filter(
			(result) => result.status === 'rejected',
		)

		this.logger.warn(JSON.stringify(failedResults))

		dto.category_logoUrl = dto.category_images[0].imageUrl
	}

	private async updateProductImage(
		productId: string,
		product: CreateProductDTO | UpdateProductDTO,
	) {
		const productImages: Record<string, any> = product.product_variants
			.flatMap((variant) => {
				// use default variant image in case user does not specify image for variant
				variant.image_list =
					variant.image_list.length === 0
						? [
								{
									imageName: `${randomInt(
										100,
									)}_${Date.now()}`,
									imageUrl:
										this.config.defaultProductImageUrl,
								},
						  ]
						: variant.image_list
				return variant.image_list
			})
			.reduce((pre, cur) => {
				return {
					...pre,
					[cur.imageName]: {
						imageName: cur.imageName,
						imageUrl: cur.imageUrl,
					},
				}
			}, {})

		const results = await Promise.allSettled(
			Object.keys(productImages).map(async (imageName) => {
				const newImageUrl = await this.imageUploader.copyFromTempTo(
					productImages[imageName].imageUrl,
					`${this.config.basePaths.product}/${productId}/${imageName}`,
				)
				productImages[imageName].imageUrl = newImageUrl
			}),
		)
		const failedResults = results.filter(
			(result) => result.status === 'rejected',
		)

		this.logger.warn(JSON.stringify(failedResults))

		product.product_variants.forEach((variant) => {
			if (variant.image_list)
				variant.image_list.forEach((image) => {
					image.imageUrl = productImages[image.imageName].imageUrl
				})
		})

		// if product banner image is not found or invalid, use first image in image list
		if (!productImages[product.product_banner_image]) {
			product.product_banner_image =
				Object.values(productImages)[0].imageUrl
		} else {
			product.product_banner_image =
				productImages[product.product_banner_image].imageUrl
		}
	}

	private async removeCategoryImage(categoryId: string) {
		await this.imageUploader.removeImagesByFolder(
			`${this.config.basePaths.category}/${categoryId}`,
		)
	}

	private async removeProductImage(productId: string) {
		await this.imageUploader.removeImagesByFolder(
			`${this.config.basePaths.product}/${productId}`,
		)
	}
}
