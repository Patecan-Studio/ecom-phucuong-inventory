import mongoose, { Schema, mongo } from 'mongoose'

export const categorySchema = new Schema(
	{
		parent_id: {
			type: Schema.Types.ObjectId,
			required: false,
		},
		category_name: {
			type: String,
			trim: true,
			maxLength: 150,
			required: true,
		},
		category_description: {
			type: String,
			trim: true,
			maxLength: 150,
		},
		category_logoUrl: {
			type: String,
			trim: true,
			maxLength: 150,
			default: 'https://via.placeholder.com/150',
		},
		category_images: [
			{
				imageName: { type: String },
				imageUrl: { type: String },
			},
		],
		category_isActive: { type: Boolean, default: true },
		isMarkedDelete: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		collection: 'Categories',
	},
)

export interface Category {
	_id: string
	parent_id: string
	category_name: string
	category_description: string
	category_logoUrl: string
	category_images: {
		imageName: string
		imageUrl: string
	}[]
}

categorySchema.index({ category_name: 'text', category_description: 'text' })

export const CategoryModel = mongoose.model('Category', categorySchema)
