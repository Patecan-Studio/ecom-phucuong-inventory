import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsArray, IsNotEmpty } from 'class-validator'
import { BrandDTO, BrandImage } from './brand.dtos'
import { SuccessResponseDTO } from '@libs'

export class CreateBrandRequestDTO {
	@ApiProperty()
	@IsNotEmpty()
	brand_name: string

	@ApiProperty()
	brand_description: string

	@ApiProperty()
	@IsNotEmpty()
	brand_logoUrl: string

	@ApiProperty({
		required: false,
		type: [BrandImage],
	})
	@IsOptional()
	@IsArray()
	@Type(() => BrandImage)
	brand_images: BrandImage[] = []
}

export class CreateBrandResponseDTO extends PartialType(SuccessResponseDTO) {
	@ApiProperty({
		type: BrandDTO,
	})
	@Type(() => BrandDTO)
	data: BrandDTO

	constructor(props: any) {
		super(props)
		Object.assign(this, props)
	}
}
