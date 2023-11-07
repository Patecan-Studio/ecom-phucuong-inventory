import { Injectable } from '@nestjs/common'
import {
	PageSection,
	PageTemplate,
	PageTemplateModel,
} from './schemas/page-template.model'
import mongoose from 'mongoose'

@Injectable()
export class PageTemplateRepository {
	genId() {
		return new mongoose.Types.ObjectId().toHexString()
	}
	async getByName(name: string): Promise<PageTemplate> {
		const result = await PageTemplateModel.findOne({
			name,
			isMarkedDelete: false,
		})
		return result.toObject({
			flattenObjectIds: true,
		})
	}
	async save(pageTemplate: PageTemplate): Promise<PageTemplate> {
		const model = new PageTemplateModel(pageTemplate)
		model.isNew = model._id ? false : true
		await model.save()
		return model.toObject({
			flattenObjectIds: true,
			transform(doc, ret, options) {
				delete ret.__v
				delete ret.isMarkedDelete
			},
		})
	}

	async updateSection(
		templateName: string,
		section: PageSection,
	): Promise<PageTemplate> {
		const pageTemplate = await PageTemplateModel.findOne({
			name: templateName,
		})
		if (!pageTemplate) {
			return null
		}

		const existingSectionIndex = pageTemplate.section_list.findIndex(
			(s) => s.name === section.name,
		)
		if (existingSectionIndex === -1) {
			pageTemplate.section_list.push(section)
			await pageTemplate.save()
		} else {
			pageTemplate.section_list[existingSectionIndex] = section
			await pageTemplate.save()
		}

		return pageTemplate.toObject({
			flattenObjectIds: true,
			transform(doc, ret, options) {
				delete ret.__v
				delete ret.isMarkedDelete
			},
		})
	}
}
