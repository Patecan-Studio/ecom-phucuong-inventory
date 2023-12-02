import {
	DuplicateProductVariantException,
	InsufficientProductVariantException,
	InvalidProductVariantException,
	InvalidProductVariantTypeException,
	MissingProductVariantException,
} from '../errors/product.errors'
import {
	CreateProductDTO,
	CreateProductVariantDTO,
	UpdateProductDTO,
} from './interfaces'
import {
	ProductVariant,
	SerializedProductVariant,
	VariantProperty,
} from './product-variant'
import { NONE_VARIANT, ProductStatus, ProductVariantStatus } from './types'

export interface ProductProps {
	_id?: string
	product_name: string
	product_description: string
	product_banner_image: string
	product_brand: string
	product_categories: string[]
	product_variants: ProductVariant[]
	product_status: ProductStatus
	product_warranty: string
}

export type SerializedProduct = Omit<ProductProps, 'product_variants'> & {
	product_variants: SerializedProductVariant[]
}

export class Product {
	constructor(props: ProductProps) {
		this.props = props
		this.validate()
	}

	get variantType() {
		return this.props.product_variants[0].variantType
	}

	setId(id: string) {
		if (this.props._id) {
			return
		}
		this.props._id = id
	}

	update(dto: UpdateProductDTO) {
		this.props.product_status = ProductStatus.Published

		const { product_variants } = this.props

		product_variants.forEach((variant) => {
			const updated = dto.product_variants.find(
				(updated) => updated.sku === variant.sku,
			)
			if (!updated) {
				throw new MissingProductVariantException(variant.sku)
			}

			const { property_list, metadata } =
				Product.createPropertyList(updated)

			variant.update({
				...updated,
				metadata,
				property_list,
			})
		})

		if (dto.product_variants.length > this.props.product_variants.length) {
			const newVariantList = dto.product_variants.filter(
				(variant) =>
					!this.props.product_variants.find(
						(v) => v.sku === variant.sku,
					),
			)

			newVariantList.forEach((variant) => {
				const { property_list, metadata } =
					Product.createPropertyList(variant)
				product_variants.push(
					ProductVariant.create({
						...variant,
						metadata,
						property_list,
					}),
				)
			})
		}

		this.props.product_name = dto.product_name
		this.props.product_description = dto.product_description
		this.props.product_banner_image = dto.product_banner_image
		this.props.product_brand = dto.product_brand
		this.props.product_categories = dto.product_categories
		this.props.product_warranty =
			dto.product_warranty || this.props.product_warranty

		this.validate()
	}

	serialize(): SerializedProduct {
		const { product_variants, ...raw } = this.props as any
		const rawVariants = product_variants.map((variant) =>
			variant.serialize(),
		)
		raw.product_variants = rawVariants
		return raw
	}

	private props: ProductProps

	protected validate() {
		this.validateVariant()
	}

	private validateVariant() {
		const activeProductVariants = this.props.product_variants.filter(
			(variant) => variant.status === ProductVariantStatus.Active,
		)
		if (
			this.props.product_status === ProductStatus.Published &&
			activeProductVariants.length === 0
		) {
			throw new InsufficientProductVariantException()
		}

		if (activeProductVariants.length === 1) {
			return
		}

		// if there are multiple variants, SKU must be unique and variant type of all variants must be the same regardless of their status
		const validVariantType = this.props.product_variants[0].variantType
		const variantSet = new Set()
		const skuCodeSet = new Set()
		for (const variant of this.props.product_variants) {
			if (
				variant.variantType !== validVariantType ||
				variant.variantType == NONE_VARIANT.type
			) {
				throw new InvalidProductVariantTypeException(
					validVariantType,
					variant.variantType,
				)
			}
			if (
				variantSet.has(variant.variantValue) ||
				skuCodeSet.has(variant.sku)
			) {
				throw new DuplicateProductVariantException(
					`${variant.sku}: ${variant.variantValue}`,
				)
			}
			skuCodeSet.add(variant.sku)
			variantSet.add(variant.variantValue)
		}
	}

	static createProduct(dto: CreateProductDTO) {
		const { isPublished, product_variants, ...props } = dto

		const status = isPublished
			? ProductStatus.Published
			: ProductStatus.Draft

		const variants = dto.product_variants.map((variant) => {
			const { property_list, metadata } =
				Product.createPropertyList(variant)
			return ProductVariant.create({
				...variant,
				metadata,
				property_list: property_list,
			})
		})

		return new Product({
			...props,
			product_variants: variants,
			product_status: status,
		})
	}

	private static createPropertyList(variant: CreateProductVariantDTO) {
		const property_list: VariantProperty[] = []
		const metadata = {}
		if (variant.color) {
			property_list.push({
				key: 'color',
				value: variant.color.value,
			})
			metadata['color'] = variant.color
		}
		if (variant.material) {
			property_list.push({
				key: 'material',
				value: variant.material,
			})
			metadata['material'] = variant.material
		}
		if (variant.measurement) {
			const { height, length, width, weight, sizeUnit, weightUnit } =
				variant.measurement
			const value = `${width}x${length}x${height}(${sizeUnit})|${weight}(${weightUnit})` // 10x10x10(cm)|10(kg)
			property_list.push({
				key: 'measurement',
				value,
			})
			metadata['measurement'] = {
				width,
				length,
				height,
				weight,
				sizeUnit,
				weightUnit,
			}
		}

		return {
			property_list,
			metadata,
		}
	}
}
