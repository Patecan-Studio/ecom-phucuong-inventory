import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator'

export class PageSectionDTO {
	@ApiProperty()
	@IsNotEmpty()
	name: string

	@ApiProperty()
	@IsNotEmpty()
	type: string;

	[key: string]: any
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

export class FooterSectionDTO extends PartialType(PageSectionDTO) {
	@ApiProperty()
	@IsNotEmpty()
	background_image_url: string

	@ApiProperty()
	display_text: string
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
