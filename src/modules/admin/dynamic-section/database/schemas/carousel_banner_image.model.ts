import mongoose, { Schema } from 'mongoose'

export const carouselBannerSchema = new Schema(
	{
		carouselBanner_name: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		carouselBanner_description: {
			type: String,
			trim: true,
		},
		carouselBanner_images: [
			{
				imageName: { type: String },
				imageUrl: { type: String },
			},
		],
		carouselBanner_link: { type: String, default: '/' },
		start_date: {
			type: Date,
			default: Date.now,
		},
		end_date: {
			type: Date,
			default: Date.now,
		},
		carouselBanner_isActive: { type: Boolean, default: true },
		isMarkedDelete: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		collection: 'CarouselBanners',
	},
)

export interface CarouselBanner {
	_id: string
	carouselBanner_name: string
	carouselBanner_description: string
	carouselBanner_images: {
		imageName: string
		imageUrl: string
	}[]
	carouselBanner_link: string
	start_date?: Date
	end_date?: Date
	createdAt?: Date
	updatedAt?: Date
}

// Create Index //
carouselBannerSchema.index({
	'carouselBanner_images.imageUrl': 'text',
	carouselBanner_link: 'text',
})

export const CarouselBannerModel = mongoose.model(
	'CarouselBanner',
	carouselBannerSchema,
)
