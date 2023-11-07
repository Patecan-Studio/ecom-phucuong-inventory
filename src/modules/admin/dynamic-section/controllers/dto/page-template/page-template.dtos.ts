import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, isNotEmpty } from 'class-validator'

export class PageSectionDTO {
	@ApiProperty()
	@IsNotEmpty()
	name: string

	@ApiProperty()
	@IsNotEmpty()
	type: string
}

export class ImageDTO {
	@ApiProperty()
	@IsNotEmpty()
	image_url: string

	@ApiProperty()
	@IsNotEmpty()
	display_text: string

	@ApiProperty()
	@IsOptional()
	link_url: string
}

export class ImageSectionDTO extends PartialType(PageSectionDTO) {
	@ApiProperty({
		type: [ImageDTO],
	})
	@IsArray()
	@IsNotEmpty()
	image_list: ImageDTO[]
}

export class PageTemplateDTO {
	@ApiProperty()
	name: string

	@ApiProperty({
		type: [PageSectionDTO],
	})
	@Type(() => PageSectionDTO)
	section_list: PageSectionDTO[]

	@ApiProperty({
		type: 'number',
	})
	createdAt: number

	@ApiProperty({
		type: 'number',
	})
	updatedAt: number

	constructor(props: any) {
		Object.assign(this, props)
	}
}
