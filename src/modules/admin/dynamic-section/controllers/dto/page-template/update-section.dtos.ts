import { IsNotEmpty, Validate } from 'class-validator'
import { PageSectionDTO, PageTemplateDTO } from './page-template.dtos'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { SuccessResponseDTO } from '@libs'
import { Type } from 'class-transformer'
import { PageSectionValidator } from '../../../utils/page-section.validator'

export class UpdateSectionRequestDTO {
	@ApiProperty({
		type: PageSectionDTO,
	})
	@IsNotEmpty()
	@Validate(PageSectionValidator)
	section: PageSectionDTO
}

export class UpdateSectionResponseDTO extends PartialType(SuccessResponseDTO) {
	@ApiProperty({
		type: PageTemplateDTO,
	})
	@Type(() => PageTemplateDTO)
	data: PageTemplateDTO

	constructor(props: any) {
		super(props)
		this.data = new PageTemplateDTO(props.data)
	}
}
