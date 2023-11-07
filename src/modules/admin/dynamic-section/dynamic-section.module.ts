import { Module } from '@nestjs/common'
import { CampaignController } from './controllers/campaign.controller'
import { CampaignRepository } from './database/campaign.repository'
import { PageTemplateRepository } from './database'
import { PageTemplateDefaultController } from './controllers/page-template-default.controller'
import { DYNAMIC_SECTION_MODULE_CONFIG } from './constants'
import { ConfigService } from '@nestjs/config'

@Module({
	providers: [
		CampaignRepository,
		PageTemplateRepository,
		{
			provide: DYNAMIC_SECTION_MODULE_CONFIG,
			useFactory: (configService: ConfigService) =>
				configService.get(DYNAMIC_SECTION_MODULE_CONFIG),
			inject: [ConfigService],
		},
	],
	controllers: [CampaignController, PageTemplateDefaultController],
})
export class DynamicSectionModule {}
