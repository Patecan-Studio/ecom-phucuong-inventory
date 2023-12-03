import {
	DuplicateImageNameException,
	DuplicateProductVariantPropertyException,
	InvalidDiscountPriceException,
} from '../errors/product.errors'
import { NONE_VARIANT, ProductImage, ProductVariantStatus } from './types'

export interface ProductVariantProps {
	sku: string
	property_list: VariantProperty[]
	price: number
	discount_price: number
	discount_percentage?: number
	quantity: number
	image_list: ProductImage[]
	metadata: Record<string, any>
	status?: ProductVariantStatus
}

export interface VariantProperty {
	key: string
	value: string
}

export type UpdateVariantProps = Omit<ProductVariantProps, 'sku'>

export type SerializedProductVariant = ProductVariantProps

export class ProductVariant {
	protected props: ProductVariantProps
	protected _variant: string
	protected _variantType: string

	get sku() {
		return this.props.sku
	}

	get variantValue() {
		return this._variant
	}

	get variantType() {
		return this._variantType
	}

	get status() {
		return this.props.status
	}

	serialize(): SerializedProductVariant {
		return this.props
	}

	constructor(props: ProductVariantProps) {
		this.props = props

		this.calculateDiscountPercentage()
		this.updateVariantType()
		this.validate()
	}

	update(props: UpdateVariantProps) {
		this.props.price = props.price
		this.props.discount_price = props.discount_price
		this.calculateDiscountPercentage()

		this.props.quantity = props.quantity
		this.props.image_list = props.image_list
		this.props.metadata = props.metadata
		props.status && (this.props.status = props.status)

		this.updateVariantType()

		this.validate()
	}

	protected validate() {
		const imageSet = new Set()
		const { price, discount_price, property_list } = this.props
		if (discount_price > price) {
			throw new InvalidDiscountPriceException(price, discount_price)
		}
		this.props.image_list.forEach((image) => {
			if (imageSet.has(image.imageName)) {
				throw new DuplicateImageNameException(image.imageName)
			}
			imageSet.add(image.imageName)
		})

		// check if field name of property_list is unique
		const propertySet = new Set()
		property_list.forEach((property) => {
			if (propertySet.has(property.key)) {
				throw new DuplicateProductVariantPropertyException(property.key)
			}
			propertySet.add(property.key)
		})
	}

	protected updateVariantType() {
		// sort property_list by name
		this.props.property_list = this.props.property_list.sort((a, b) => {
			if (a.key < b.key) {
				return -1
			}
			if (a.key > b.key) {
				return 1
			}
			return 0
		})

		const { property_list } = this.props
		if (property_list.length === 0) {
			this._variantType = NONE_VARIANT.type
			this._variant = NONE_VARIANT.value
			return
		}
		this._variantType = property_list
			.map((property) => property.key)
			.join('#')
		this._variant = property_list
			.map((property) => property.value)
			.join('#')
	}

	protected calculateDiscountPercentage() {
		const { price, discount_price } = this.props
		if (price === 0) {
			this.props.discount_percentage = 0
			this.props.discount_price = 0
		} else {
			this.props.discount_percentage = Math.round(
				((price - discount_price) / price) * 100,
			)
		}
	}

	static create(props: ProductVariantProps) {
		return new ProductVariant(props)
	}
}
