import mongoose, { Schema } from 'mongoose'
import { PAGE_TEMPLATE_MODEL } from '../../constants'

export const pageTemplateSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		section_list: [
			{
				type: Schema.Types.Mixed,
			},
		],
		isMarkedDelete: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		collection: 'PageTemplate',
	},
)

export interface PageSection {
	name: string
	type: string
	[key: string]: any
}

// Create Index //
pageTemplateSchema.index({ name: 1 }, { unique: true })

export const PageTemplateModel = mongoose.model(
	PAGE_TEMPLATE_MODEL,
	pageTemplateSchema,
)

export interface PageTemplate {
	_id: string
	name: string
	section_list: PageSection[]
	isMarkedDelete: boolean
	createdAt?: Date
	updatedAt?: Date
}
