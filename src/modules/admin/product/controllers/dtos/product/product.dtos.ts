import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
	IsArray,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Validate,
	ValidateIf,
	ValidateNested,
} from 'class-validator'
import { BrandDTO } from '../brand/brand.dtos'
import { DateStringToTimestamp } from 'src/libs/decorators'
import { ProductVariantStatus } from '@modules/admin/product/domain'
import { CategoryDTO } from '../category/category.dtos'
import { SIZE_UNIT } from '../../../constants'
import { isNullOrUndefined } from '@libs'

export class ProductColor {
	@ApiProperty()
	@IsNotEmpty()
	value: string

	@ApiProperty()
	@IsNotEmpty()
	label: string
}

export class ProductSize {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@Validate((params) => params.value >= 0)
	width: number

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@Validate((params) => params.value >= 0)
	length: number

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@Validate((params) => params.value >= 0)
	height: number

	@ApiProperty()
	@IsNotEmpty()
	@IsIn(SIZE_UNIT)
	unit: string
}

export class ProductWeight {
	@ApiProperty()
	@IsNotEmpty()
	unit: string

	@ApiProperty()
	@IsNotEmpty()
	value: number
}

export class ProductImage {
	@ApiProperty()
	@IsNotEmpty()
	imageName: string

	@ApiProperty()
	@IsNotEmpty()
	imageUrl: string
}
export class ProductVariantDTO {
	@ApiProperty()
	@IsNotEmpty()
	sku: string

	@ApiProperty({
		type: ProductColor,
	})
	@ValidateIf((params) => {
		console.log(params)
		return !isNullOrUndefined(params.color)
	})
	color: ProductColor

	@ApiProperty()
	@ValidateIf((params) => !isNullOrUndefined(params.material))
	material: string

	@ApiProperty({
		type: ProductSize,
	})
	@Type(() => ProductSize)
	@ValidateNested()
	@ValidateIf((params) => !isNullOrUndefined(params.size))
	size: ProductSize

	@ApiProperty({
		type: ProductWeight,
	})
	@Type(() => ProductWeight)
	@ValidateNested()
	@ValidateIf((params) => !isNullOrUndefined(params.weight))
	weight: ProductWeight

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	quantity: number

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	price: number

	@ApiProperty({
		required: false,
	})
	@IsNumber()
	@Transform((params) => params.value ?? params.obj.price)
	discount_price: number

	@ApiProperty({
		type: [ProductImage],
	})
	@Type(() => ProductImage)
	@IsArray()
	@IsOptional()
	@ValidateNested()
	image_list: ProductImage[] = []

	@ApiProperty({
		type: ProductVariantStatus,
		required: false,
		enum: [ProductVariantStatus.Active, ProductVariantStatus.Inactive],
	})
	@IsOptional()
	status: ProductVariantStatus = ProductVariantStatus.Active
}

export class ProductDTO {
	@ApiProperty()
	product_name: string

	@ApiProperty()
	product_description: string

	@ApiProperty({
		type: String,
	})
	product_banner_image: string

	@ApiProperty({
		type: BrandDTO,
	})
	@Type(() => BrandDTO)
	product_brand: BrandDTO

	@ApiProperty({
		type: [CategoryDTO],
	})
	@Type(() => CategoryDTO)
	product_categories: CategoryDTO[]

	@ApiProperty({
		type: [ProductVariantDTO],
	})
	@Type(() => ProductVariantDTO)
	product_variants: ProductVariantDTO[]

	@ApiProperty()
	status: string

	@ApiProperty()
	has_color: boolean

	@ApiProperty()
	has_material: boolean

	@ApiProperty()
	has_size: boolean

	@ApiProperty()
	has_weight: boolean

	@ApiProperty()
	product_warranty: string

	@ApiProperty({
		type: Number,
	})
	@DateStringToTimestamp()
	createdAt: Date

	@ApiProperty({
		type: Number,
	})
	@DateStringToTimestamp()
	updatedAt: Date

	constructor(props: any) {
		Object.assign(this, props)

		this.product_variants = props.product_variants.map((variant) => {
			const { property_list, ...variantProps } = variant
			const properties = property_list.reduce((pre, cur) => {
				const { name, ...property } = cur
				pre[name] = property
				return pre
			}, {})
			return {
				...variantProps,
				color: properties.color,
				material: properties.material.value,
				size: properties.size,
				weight: properties.weight,
			}
		})

		const firstVariant = this.product_variants[0]

		this.has_color = !!firstVariant.color
		this.has_material = !!firstVariant.material
		this.has_size = !!firstVariant.size
		this.has_weight = !!firstVariant.weight
	}
}
