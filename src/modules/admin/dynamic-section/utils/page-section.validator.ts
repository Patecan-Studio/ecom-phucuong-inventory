import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	validate,
} from 'class-validator'
import {
	FooterSectionDTO,
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
			case 'footer':
				validateErrors = await this.validateFooterSection(
					section as FooterSectionDTO,
				)
				break
			default:
				return false
		}

		if (validateErrors.length > 0) {
			console.log(validateErrors)
			return false
		}
		return true
	}

	defaultMessage(args: ValidationArguments) {
		// here you can provide default error message if validation failed
		return 'Invalid page section'
	}

	private validateImageSection(section: ImageSectionDTO) {
		const instance = plainToInstance(ImageSectionDTO, section)
		return validate(instance)
	}

	private validateFooterSection(section: FooterSectionDTO) {
		const instance = plainToInstance(FooterSectionDTO, section)
		return validate(instance)
	}
}
