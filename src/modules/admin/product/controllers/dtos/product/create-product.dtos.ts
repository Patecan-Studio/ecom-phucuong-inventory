import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsNotEmpty,
	IsOptional,
	ValidateNested,
} from 'class-validator'
import { SuccessResponseDTO } from '@libs'
import { ProductDTO, ProductVariantDTO } from './product.dtos'

export type CreateProductVariantDTO = ProductVariantDTO

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
	@IsOptional()
	product_banner_image: string

	@ApiProperty({
		required: false,
	})
	@IsOptional()
	product_warranty: string = null

	@ApiProperty({
		type: [ProductVariantDTO],
	})
	@Type(() => ProductVariantDTO)
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
