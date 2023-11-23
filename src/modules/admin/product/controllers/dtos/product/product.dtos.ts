import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsNumber, Validate } from 'class-validator'
import { BrandDTO } from '../brand/brand.dtos'
import { DateStringToTimestamp } from 'src/libs/decorators'
import { ProductVariantStatus } from '@modules/admin/product/domain'
import { CategoryDTO } from '../category/category.dtos'
import { SIZE_UNIT } from '../../../constants'

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

	@ApiProperty()
	color: ProductColor

	@ApiProperty()
	material: string

	@ApiProperty()
	size: ProductSize

	@ApiProperty()
	quantity: number

	@ApiProperty()
	price: number

	@ApiProperty()
	@Transform((params) => {
		return params.value ?? params.obj.price
	})
	discount_price: number

	@ApiProperty()
	discount_percentage: number

	@ApiProperty({
		type: [ProductImage],
	})
	@Type(() => ProductImage)
	image_list: ProductImage[]

	@ApiProperty({
		type: ProductVariantStatus,
		enum: [ProductVariantStatus.Active, ProductVariantStatus.Inactive],
	})
	status: ProductVariantStatus
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

	@ApiProperty()
	has_color: boolean

	@ApiProperty()
	has_material: boolean

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
		const firstVariant = props.product_variants[0]

		this.has_color = !!firstVariant.color
		this.has_material = !!firstVariant.material
	}
}
