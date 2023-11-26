import { CreateProductDTO, ProductVariantStatus } from '../../domain'
import { ProductVariantFactory } from './product-variant.factory'

export class ProductDTOBuilder {
	private _result: CreateProductDTO

	get result() {
		return this._result
	}

	createProduct(isPublished = true) {
		this._result = {
			product_name: '',
			product_description: '',
			product_banner_image: '',
			product_brand: '',
			product_categories: [],
			product_warranty: '',
			isPublished,
			product_variants: [],
		}
		return this
	}

	withBannerImage(imageUrl: string) {
		this._result.product_banner_image = imageUrl
		return this
	}

	withOneVariant(
		property_list: string[],
		status: ProductVariantStatus = ProductVariantStatus.Active,
	) {
		this._result.product_variants.push(
			ProductVariantFactory.createVariant('SKU01', property_list, status),
		)
		this._result.product_banner_image =
			this._result.product_variants[0].image_list[0].imageUrl

		return this
	}

	withPrice(price: number, discount_price: number) {
		this._result.product_variants.forEach((variant) => {
			variant.price = price
			variant.discount_price = discount_price
		})
		return this
	}

	withVariant(sku: string, property_list: string[]) {
		this._result.product_variants.push(
			ProductVariantFactory.createVariant(sku, property_list),
		)
		this._result.product_banner_image =
			this._result.product_variants[0].image_list[0].imageUrl

		return this
	}

	withMultipleVariantsOfDifferentType() {
		this._result.product_variants = [
			ProductVariantFactory.createVariant('SKU01', ['color']),
			ProductVariantFactory.createVariant('SKU02', ['material']),
			ProductVariantFactory.createVariant('SKU03', ['color', 'material']),
		]

		this._result.product_banner_image =
			this._result.product_variants[0].image_list[0].imageUrl

		return this
	}

	withDuplicateVariantSKU(sku: string) {
		this._result.product_variants = [
			ProductVariantFactory.createVariant(sku, ['color']),
			ProductVariantFactory.createVariant(sku, ['color']),
		]

		this._result.product_banner_image =
			this._result.product_variants[0].image_list[0].imageUrl

		return this
	}

	withDuplicateVariantValue(
		color: string,
		material?: string,
		size?: { width: number; height: number; length: number; unit: string },
		weight?: { value: number; unit: string },
	) {
		const property_list = [
			{
				name: 'color',
				value: {
					value: color,
					label: color,
				},
			},
			{
				name: 'material',
				value: material,
			},
			{
				name: 'size',
				value: size,
			},
			{
				name: 'weight',
				value: weight,
			},
		]
		this._result.product_variants = [
			ProductVariantFactory.createVariantWithValue(
				'SKU01',
				property_list,
			),
			ProductVariantFactory.createVariantWithValue(
				'SKU02',
				property_list,
			),
			ProductVariantFactory.createVariantWithValue(
				'SKU03',
				property_list,
			),
		]

		this._result.product_banner_image =
			this._result.product_variants[0].image_list[0].imageUrl

		return this
	}
}
