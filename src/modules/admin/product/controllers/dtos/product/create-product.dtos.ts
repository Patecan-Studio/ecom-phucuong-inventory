import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	MinLength,
	ValidateIf,
	ValidateNested,
} from 'class-validator'
import { SIZE_UNIT } from '../../../constants'
import { SuccessResponseDTO, isNullOrUndefined } from '@libs'
import {
	ProductColor,
	ProductDTO,
	ProductImage,
	ProductSize,
	ProductWeight,
} from './product.dtos'
import { ProductVariantStatus } from '../../../domain'

export class CreateProductVariantDTO {
	@ApiProperty()
	@IsNotEmpty()
	sku: string

	@ApiProperty({
		type: ProductColor,
	})
	color: ProductColor

	@ApiProperty()
	material: string

	@ApiProperty({
		type: ProductSize,
	})
	@Type(() => ProductSize)
	@ValidateNested()
	@ValidateIf((params) => !isNullOrUndefined(params.obj.size))
	size: ProductSize

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

export class CreateProductRequestDTO {
	@ApiProperty()
	@IsNotEmpty()
	product_name: string

	@ApiProperty()
	@IsNotEmpty()
	product_description: string

	@ApiProperty()
	product_brand: string

	@ApiProperty()
	product_categories: string[]

	@ApiProperty()
	@Type(() => ProductWeight)
	product_weight: ProductWeight

	@ApiProperty()
	product_height: number

	@ApiProperty()
	product_width: number

	@ApiProperty()
	product_length: number

	@ApiProperty()
	@IsNotEmpty()
	@IsIn(SIZE_UNIT)
	product_size_unit: string

	@ApiProperty()
	@IsOptional()
	product_banner_image: string

	@ApiProperty({
		required: false,
	})
	@IsOptional()
	product_warranty: string = null

	@ApiProperty({
		type: [CreateProductVariantDTO],
	})
	@Type(() => CreateProductVariantDTO)
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	product_variants: CreateProductVariantDTO[]

	@ApiProperty({
		required: false,
		default: true,
	})
	isPublished: boolean = true
}

export class CreateProductResponseDTO extends PartialType(SuccessResponseDTO) {
	@ApiProperty({
		type: ProductDTO,
	})
	@Type(() => ProductDTO)
	data: ProductDTO

	constructor(props: Partial<CreateProductResponseDTO>) {
		super(props)
		Object.assign(this, props)
	}
}
