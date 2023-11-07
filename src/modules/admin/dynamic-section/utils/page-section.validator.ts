import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	validate,
} from 'class-validator'
import {
	ImageSectionDTO,
	PageSectionDTO,
} from '../controllers/dto/page-template/page-template.dtos'
import { plainToInstance } from 'class-transformer'
import { ValidationError } from '@nestjs/common'

@ValidatorConstraint({ name: 'pageSection', async: false })
export class PageSectionValidator implements ValidatorConstraintInterface {
	async validate(section: PageSectionDTO, args: ValidationArguments) {
		let validateErrors: ValidationError[]
		switch (section.type) {
			case 'image':
				validateErrors = await this.validateImageSection(
					section as ImageSectionDTO,
				)
				break
			default:
				return false
		}

		if (validateErrors.length > 0) {
			return false
		}
		return true
	}

	defaultMessage(args: ValidationArguments) {
		// here you can provide default error message if validation failed
		return 'Invalid page section'
	}

	private validateImageSection(section: ImageSectionDTO) {
		const instance = plainToInstance(ImageSectionDTO, section.image_list)
		return validate(instance)
	}
}
