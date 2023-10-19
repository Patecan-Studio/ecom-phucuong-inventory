import { ApiProperty, PartialType } from '@nestjs/swagger'
import { ProductDTO } from './common.dtos'
import { SuccessResponseDTO } from '@libs'
import { BrandDTO } from '@modules/admin/product/controllers/dtos/brand/brand.dtos'
import { Type } from 'class-transformer'
import { CategoryDTO } from '@modules/admin/product/controllers/dtos/common.dto'

export class SearchProductsQueryDTO {
	@ApiProperty({
		required: false,
	})
	@Type(() => Number)
	page: number = 1

	@ApiProperty({
		required: false,
	})
	@Type(() => Number)
	page_size: number = 20
}

export class SearchProductsResponseDTO extends PartialType(SuccessResponseDTO) {
	@ApiProperty()
	resultCode: string

	@ApiProperty()
	resultMessage: string

	@ApiProperty({
		type: [ProductDTO],
	})
	@Type(() => ProductDTO)
	items: ProductDTO[]

	@ApiProperty()
	total_count: number

	@ApiProperty()
	page: number

	@ApiProperty()
	page_size: number

	constructor(props: any) {
		super(props)
		Object.assign(this, props)
	}
}
