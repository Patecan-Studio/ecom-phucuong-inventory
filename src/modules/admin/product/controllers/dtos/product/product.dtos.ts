import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
	IsArray,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
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

export class ProductMeasurement {
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
	@IsNumber()
	@Validate((params) => params.value >= 0)
	weight: number

	@ApiProperty()
	@IsNotEmpty()
	@IsIn(SIZE_UNIT)
	sizeUnit: string

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	weightUnit: string
}

export class ProductImage {
	@ApiProperty({
		required: true,
		description:
			'Name of the image. This name must be unique within variant',
		example: '5001698574720731',
	})
	@IsNotEmpty()
	imageName: string

	@ApiProperty({
		required: true,
		description:
			'When create or update product, this value is path of image in temp folder. When get product, this value is path of image in public folder',
		example: 'temp/5001698574720731',
	})
	@IsNotEmpty()
	imageUrl: string
}
export class ProductVariantDTO {
	@ApiProperty({
		required: false,
		description:
			'SKU of the product variant. SKU must be unique across all products',
		example: 'SKU-011223-01-001',
	})
	@IsNotEmpty()
	sku: string

	@ApiProperty({
		type: ProductColor,
		description:
			'Color of the product. This is one of the variant properties',
		example: {
			label: 'Đỏ',
			value: '#ff0000',
		},
	})
	@ValidateIf((params) => {
		console.log(params)
		return !isNullOrUndefined(params.color)
	})
	color: ProductColor

	@ApiProperty({
		required: false,
		description:
			'Material of the variant. This is one of the variant properties',
		example: 'Vải',
	})
	@ValidateIf((params) => !isNullOrUndefined(params.material))
	material: string

	@ApiProperty({
		type: ProductMeasurement,
		required: false,
		description:
			'Measurement of the variant. This is one of the variant properties',
		example: {
			width: 10,
			length: 20,
			height: 30,
			weight: 5,
			sizeUnit: 'cm',
			weightUnit: 'kg',
		},
	})
	@Type(() => ProductMeasurement)
	@ValidateNested()
	@ValidateIf((params) => !isNullOrUndefined(params.size))
	measurement: ProductMeasurement

	@ApiProperty({
		required: true,
		description: 'Quantity of the variant',
		example: 10,
	})
	@IsNotEmpty()
	@IsNumber()
	quantity: number

	@ApiProperty({
		required: true,
		description: 'Price of the variant',
		example: 100000,
	})
	@IsNotEmpty()
	@IsNumber()
	price: number

	@ApiProperty({
		required: false,
		description:
			'Discount price of the variant. This value should be less than price',
		example: 90000,
	})
	@IsNumber()
	@Transform((params) => params.value ?? params.obj.price)
	discount_price: number

	@ApiProperty({
		type: [ProductImage],
		required: false,
		description: 'List of images of the variant',
		example: [
			{
				imageName: '5001698574720731',
				imageUrl: 'temp/5001698574720731',
			},
			{
				imageName: '4291698574408393',
				imageUrl: 'temp/4291698574408393',
			},
		],
	})
	@Type(() => ProductImage)
	@IsArray()
	@IsOptional()
	@ValidateNested()
	image_list: ProductImage[] = []

	@ApiProperty({
		type: ProductVariantStatus,
		required: false,
		description:
			'Status of the product. When status is Inactive, this variant will not be shown in client app. Default is Active',
		enum: [ProductVariantStatus.Active, ProductVariantStatus.Inactive],
		example: ProductVariantStatus.Active,
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
	has_measurement: boolean

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
			const { property_list, metadata, ...variantProps } = variant
			return {
				...variantProps,
				color: metadata.color ?? null,
				material: metadata.material ?? null,
				measurement: metadata.measurement ?? null,
			}
		})

		const firstVariant = this.product_variants[0]

		this.has_color = !!firstVariant.color
		this.has_material = !!firstVariant.material
		this.has_measurement = !!firstVariant.measurement
	}
}
