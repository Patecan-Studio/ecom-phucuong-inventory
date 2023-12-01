import { ApiProperty, PartialType } from '@nestjs/swagger'
import { ProductDTO, ProductVariantDTO } from './product.dtos'
import { Type } from 'class-transformer'
import { SuccessResponseDTO } from '@libs'
import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsOptional,
	ValidateNested,
} from 'class-validator'

export class UpdateProductRequestDTO {
	@ApiProperty({
		description: 'Name of the product. Name of product must be unique',
		example: `Test product 011223 01`,
	})
	@IsNotEmpty()
	product_name: string

	@ApiProperty({
		description: 'This is test product',
	})
	product_description: string

	@ApiProperty({
		description: 'Path of banner image in temp folder',
		example: 'temp/5001698574720731',
	})
	@IsNotEmpty()
	product_banner_image: string

	@ApiProperty({
		description: 'ID of brand',
		example: '653e4c45c2c90dd459bb8976',
	})
	@IsNotEmpty()
	product_brand: string

	@ApiProperty({
		description: 'List IDs of categories. Min size is 1',
		example: ['653b4c7085e86f091c56cb06'],
	})
	@IsArray()
	@ArrayMinSize(1)
	product_categories: string[]

	@ApiProperty({
		type: [ProductVariantDTO],
	})
	@Type(() => ProductVariantDTO)
	@ValidateNested()
	product_variants: ProductVariantDTO[]

	@ApiProperty({
		required: false,
		description: 'Warranty of product',
		example: '12 tháng',
	})
	@IsOptional()
	product_warranty: string = null

	@ApiProperty({
		required: false,
		description:
			'Status of product. If product is Draft, it will not be shown in client app. Default is Published',
		example: true,
		default: true,
	})
	isPublished: boolean = true
}

export class UpdateProductResponseDTO extends PartialType(SuccessResponseDTO) {
	@ApiProperty({
		type: ProductDTO,
	})
	@Type(() => ProductDTO)
	data: ProductDTO

	constructor(props: Partial<UpdateProductResponseDTO>) {
		super(props)
		Object.assign(this, props)
	}
}
