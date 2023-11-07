import { BaseException } from '@libs'

export class PageTemplateNotFoundException extends BaseException {
	public code = 'PAGE_TEMPLATE_NOT_FOUND'

	constructor(templateName: string) {
		super(`Page template with name '${templateName}' not found`)
	}
}
