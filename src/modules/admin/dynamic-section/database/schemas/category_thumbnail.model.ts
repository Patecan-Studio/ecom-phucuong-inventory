import mongoose, { Schema } from 'mongoose'

export const categoryThumbnailSchema = new Schema(
	{
		categoryThumbnail_name: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		categoryThumbnail_description: {
			type: String,
			trim: true,
		},
		categoryThumbnail_types: {
			type: String,
			enum: ['grid', 'slider'],
		},
		categoryThumbnails_ids: [
			{ type: Schema.Types.ObjectId, ref: 'Category' },
		],
	},
	{
		timestamps: true,
		collection: 'CategoryThumbnails',
	},
)

export interface CategoryThumbnail {
	_id: string
	categoryThumbnail_name: string
	categoryThumbnail_description: string
	categoryThumbnail_types: string
	categoryThumbnails_ids: []
	createdAt?: Date
	updatedAt?: Date
}

// Create Index //
categoryThumbnailSchema.index({ categoryThumbnails_ids: 'text' })

export const CategoryThumbnailModel = mongoose.model(
	'CategoryThumbnail',
	categoryThumbnailSchema,
)
