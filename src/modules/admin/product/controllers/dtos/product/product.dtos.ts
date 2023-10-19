import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import { BrandDTO } from '../brand/brand.dtos'
import { CategoryDTO } from '../common.dto'
import { DateStringToTimestamp } from 'src/libs/decorators'

export class ProductColor {
	@ApiProperty()
	@IsNotEmpty()
	value: string

	@ApiProperty()
	@IsNotEmpty()
	label: string
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
	sku: string

	@ApiProperty()
	color: ProductColor

	@ApiProperty()
	material: string

	@ApiProperty()
	quantity: number

	@ApiProperty()
	price: number

	@ApiProperty()
	discount_price: number

	@ApiProperty({
		type: [ProductImage],
	})
	@Type(() => ProductImage)
	image_list: ProductImage[]
}

export class ProductDTO {
	@ApiProperty()
	product_name: string

	@ApiProperty()
	product_description: string

	@ApiProperty({
		type: ProductImage,
	})
	@Type(() => ProductImage)
	product_banner_image: ProductImage

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

	@ApiProperty()
	product_height: number

	@ApiProperty()
	product_width: number

	@ApiProperty()
	product_length: number

	@ApiProperty()
	product_size_unit: string[]

	@ApiProperty()
	@Type(() => ProductWeight)
	product_weight: ProductWeight

	@ApiProperty({
		type: [ProductVariantDTO],
	})
	@Type(() => ProductVariantDTO)
	product_variants: ProductVariantDTO[]

	@ApiProperty()
	status: string

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
	}
}