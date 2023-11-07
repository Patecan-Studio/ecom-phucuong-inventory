import mongoose, { Schema } from 'mongoose'

export const campaignSchema = new Schema(
	{
		campaign_name: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		campaign_content: {
			type: String,
			trim: true,
		},
		campaign_images: [
			{
				imageName: { type: String },
				imageUrl: { type: String },
			},
		],
		campaign_link: { type: String, default: '/' },
		start_date: {
			type: Date,
			default: Date.now,
		},
		end_date: {
			type: Date,
			default: Date.now,
		},
		campaign_isActive: { type: Boolean, default: true },
		isMarkedDelete: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		collection: 'Campaigns',
	},
)

export interface Campaign {
	_id: string
	campaign_name: string
	campaign_content: string
	campaign_images: {
		imageName: string
		imageUrl: string
	}[]
	campaign_link: string
	start_date?: Date
	end_date?: Date
	createdAt?: Date
	updatedAt?: Date
}

// Create Index //
campaignSchema.index({ campaign_name: 'text', campaign_link: 'text' })

export const CampaignModel = mongoose.model('Campaign', campaignSchema)
