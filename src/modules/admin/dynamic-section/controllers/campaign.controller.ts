import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Logger,
	Post,
	UseInterceptors,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { AdminAuth } from '@modules/admin/auth'
import mongoose from 'mongoose'
import { CampaignRepository } from '@modules/admin/dynamic-section/database/campaign.repository'
import { Campaign } from '@modules/admin/dynamic-section/database/schemas/campaign.model'
import {
	CreateCampaignRequestDTO,
	CreateCampaignResponseDTO,
} from '@modules/admin/dynamic-section/controllers/dto/campaign/campaign.dto'

@Controller('v1/admin/campaigns')
@ApiTags('Admin - Campaign')
@UseInterceptors(ClassSerializerInterceptor)
@AdminAuth('apiKey')
export class CampaignController {
	private readonly logger: Logger = new Logger(CampaignController.name)

	constructor(private readonly campaignRepo: CampaignRepository) {}

	@Post()
	@ApiResponse({
		status: 201,
		type: CreateCampaignResponseDTO,
	})
	async create(
		@Body() dto: CreateCampaignRequestDTO,
	): Promise<CreateCampaignResponseDTO> {
		let campaign: Campaign = {
			_id: new mongoose.Types.ObjectId().toHexString(),
			...dto,
		}

		try {
			campaign = await this.campaignRepo.create(campaign)
			return new CreateCampaignResponseDTO({ data: campaign })
		} catch (error) {
			this.logger.error(error)
			throw error
		}
	}
}
