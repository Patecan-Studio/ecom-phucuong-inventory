import { ApiProperty, PartialType } from '@nestjs/swagger'
import { ProductDetailResponseDTO } from './product.dtos'
import { ResultCode } from 'src/libs/enums/result-code.enum'
import { SuccessResponseDTO } from '@libs'
import { Type } from 'class-transformer'

export class GetProductDetailResponseDTO extends PartialType(
	SuccessResponseDTO,
) {
	@ApiProperty()
	resultCode: string

	@ApiProperty()
	message: string

	@ApiProperty({
		type: ProductDetailResponseDTO,
	})
	@Type(() => ProductDetailResponseDTO)
	data: ProductDetailResponseDTO

	constructor(props: any) {
		super(props)
		Object.assign(this, props)
	}
}
