import mongoose, { Schema } from 'mongoose'

export const campaignFooterInfoSchema = new Schema(
	{
		campaignFooterInfo_name: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		campaignFooterInfo_content: {
			type: String,
			trim: true,
		},
		campaignFooterInfo_image: {
			imageName: { type: String },
			imageUrl: { type: String },
		},
		campaignFooterInfo_link: { type: String, default: '/' },
		start_date: {
			type: Date,
			default: Date.now,
		},
		end_date: {
			type: Date,
			default: Date.now,
		},
		campaignFooterInfo_isActive: { type: Boolean, default: true },
		isMarkedDelete: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		collection: 'CampaignFooterInfos',
	},
)

export interface CampaignFooterInfo {
	_id: string
	campaignFooterInfo_name: string
	campaignFooterInfo_content: string
	campaignFooterInfo_image: {
		imageName: string
		imageUrl: string
	}
	campaignFooterInfo_link: string
	start_date?: Date
	end_date?: Date
	createdAt?: Date
	updatedAt?: Date
}

// Create Index //

export const CampaignFooterInfoModel = mongoose.model(
	'CampaignFooterInfo',
	campaignFooterInfoSchema,
)
