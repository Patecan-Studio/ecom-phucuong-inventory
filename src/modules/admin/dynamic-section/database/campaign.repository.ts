import { Injectable, Logger } from '@nestjs/common'
import mongoose from 'mongoose'
import { Utils } from '@libs'
import { MongoDBErrorHandler } from '@infras/mongoose'
import {
	Campaign,
	CampaignModel,
} from '@modules/admin/dynamic-section/database/schemas/campaign.model'
import { CampaignExistsException } from '@modules/admin/dynamic-section/errors/dynamic-section.errors'

@Injectable()
export class CampaignRepository {
	private logger: Logger = new Logger(CampaignRepository.name)
	constructor() {}

	async create(campaign: Partial<Campaign>): Promise<Campaign> {
		const campaignModel = new CampaignModel({
			_id: campaign._id
				? new mongoose.Types.ObjectId(campaign._id)
				: new mongoose.Types.ObjectId(),
			...campaign,
		})
		try {
			const result = await campaignModel.save()
			return result.toObject({
				versionKey: false,
				flattenObjectIds: true,
				transform: (doc, ret) => {
					delete ret.__v
					delete ret.isMarkedDelete
				},
			})
		} catch (error) {
			this.logger.error(error)
			if (
				MongoDBErrorHandler.isDuplicatedKeyError(error, 'campaign_name')
			) {
				throw new CampaignExistsException(campaignModel.campaign_name)
			}
			throw error
		}
	}

	// async getById(id: string): Promise<Brand> {
	// 	const brand = await BrandModel.findById(id)
	// 		.where({
	// 			isMarkedDelete: false,
	// 		})
	// 		.select('-__v -isMarkedDelete -brand_products')
	// 	if (!brand) {
	// 		return null
	// 	}
	// 	return brand.toObject({
	// 		flattenObjectIds: true,
	// 	})
	// }
	//
	// async update(updatedBrand: Brand): Promise<Brand> {
	// 	const brand = new BrandModel(updatedBrand)
	// 	const result = await BrandModel.findOneAndUpdate(
	// 		{ _id: brand._id },
	// 		brand,
	// 		{
	// 			new: true,
	// 		},
	// 	)
	// 	return result.toObject({
	// 		flattenObjectIds: true,
	// 	})
	// }
	//
	// async deleteById(id: string): Promise<string> {
	// 	const brand = await BrandModel.findById(id)
	// 		.where({
	// 			isMarkedDelete: false,
	// 		})
	// 		.exec()
	//
	// 	if (!brand) {
	// 		return null
	// 	}
	//
	// 	brand.brand_name = `${brand.brand_name}_${Date.now()}`
	// 	brand.isMarkedDelete = true
	//
	// 	await brand.save()
	//
	// 	return brand._id.toHexString()
	// }
	//
	// async find(options: {
	// 	page: number
	// 	page_size: number
	// 	brand_name: string
	// }): Promise<{
	// 	items: Brand[]
	// 	page_size: number
	// 	page: number
	// 	total_page: number
	// 	total_count: number
	// }> {
	// 	const { page = 1, page_size = 10, brand_name } = options
	//
	// 	const filter = {
	// 		isMarkedDelete: false,
	// 		...(brand_name && {
	// 			$text: { $search: brand_name },
	// 		}),
	// 	}
	// 	const [categoryList, count] = await Promise.all([
	// 		BrandModel.find(filter)
	// 			.select('-__v -isMarkedDelete -brand_products')
	// 			.sort({
	// 				createdAt: -1,
	// 			})
	// 			.skip((page - 1) * page_size)
	// 			.limit(page_size)
	// 			.exec(),
	// 		BrandModel.countDocuments(filter),
	// 	])
	//
	// 	return {
	// 		items: categoryList.map((cat) =>
	// 			cat.toObject({
	// 				flattenObjectIds: true,
	// 			}),
	// 		),
	// 		page: page,
	// 		page_size: page_size,
	// 		total_page: Math.ceil(count / page_size),
	// 		total_count: count,
	// 	}
	// }
	//
	// async searchBrandsByKeyword(keyword: string) {
	// 	const escapedKeyword = Utils.escapeRegExp(keyword)
	// 	const regexSearch: RegExp = new RegExp(escapedKeyword, 'i') // 'i' for case-insensitive search
	//
	// 	try {
	// 		const query: Record<string, any> = {
	// 			$text: { $search: regexSearch.source },
	// 		}
	//
	// 		const results = await BrandModel.find(query)
	// 			.sort({
	// 				createdAt: -1,
	// 			})
	// 			.exec()
	//
	// 		return results
	// 	} catch (error) {
	// 		console.error('Error while searching by keyword:', error)
	// 		throw error
	// 	}
	// }
}
