import { randomInt } from 'crypto'
import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Inject,
	Logger,
	Param,
	Post,
	UseInterceptors,
} from '@nestjs/common'
import { PageTemplateRepository } from '../database'
import {
	UpdateSectionRequestDTO,
	UpdateSectionResponseDTO,
} from './dto/page-template/update-section.dtos'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { DynamicSectionModuleConfig } from '../interfaces'
import { DYNAMIC_SECTION_MODULE_CONFIG } from '../constants'
import { ImageUploader } from '@modules/admin/image-uploader'
import {
	FooterSectionDTO,
	ImageSectionDTO,
	PageTemplateDTO,
} from './dto/page-template/page-template.dtos'
import { isURL } from 'class-validator'
import { PageTemplateNotFoundException } from '../errors/page-template.errors'

@Controller('v1/admin/page-templates/default')
@ApiTags('Admin - Page Template')
@UseInterceptors(ClassSerializerInterceptor)
export class PageTemplateDefaultController {
	private readonly logger: Logger = new Logger(
		PageTemplateDefaultController.name,
	)
	private readonly PAGE_TEMPLATE_NAME = 'default'
	constructor(
		private readonly pageTemplateRepo: PageTemplateRepository,
		@Inject(DYNAMIC_SECTION_MODULE_CONFIG)
		private readonly config: DynamicSectionModuleConfig,
		private readonly imageUploader: ImageUploader,
	) {}

	@Post('sections')
	@ApiResponse({
		status: 200,
		type: UpdateSectionResponseDTO,
	})
	async savePageSection(
		@Body() dto: UpdateSectionRequestDTO,
	): Promise<UpdateSectionResponseDTO> {
		const { section } = dto
		// temporarily handle default page template only
		const pageTemplate = await this.pageTemplateRepo.getByName(
			this.PAGE_TEMPLATE_NAME,
		)
		let templateId = pageTemplate._id
		if (!pageTemplate) {
			templateId = this.pageTemplateRepo.genId()
		}

		switch (section.name) {
			case 'category_section':
			case 'category_slider':
				this.handleCategorySection(section as ImageSectionDTO)
				break
			case 'banner_section':
				await this.handleBannerSection(
					templateId,
					section as ImageSectionDTO,
				)
			case 'footer_section':
				await this.handleFooterSection(
					templateId,
					section as FooterSectionDTO,
				)
		}

		const existingSectionIndex = pageTemplate.section_list.findIndex(
			(s) => s.name === section.name,
		)
		if (existingSectionIndex === -1) {
			pageTemplate.section_list.push(section as any)
		} else {
			pageTemplate.section_list[existingSectionIndex] = section as any
		}

		await this.pageTemplateRepo.save(pageTemplate)

		return new UpdateSectionResponseDTO({
			data: {
				...pageTemplate,
				createdAt: pageTemplate.createdAt.getTime(),
				updatedAt: pageTemplate.updatedAt.getTime(),
			},
		})
	}

	@Get()
	@ApiResponse({
		status: 200,
		type: PageTemplateDTO,
	})
	async getPageTemplate(): Promise<PageTemplateDTO> {
		const pageTemplate = await this.pageTemplateRepo.getByName(
			this.PAGE_TEMPLATE_NAME,
		)

		if (!pageTemplate) {
			throw new PageTemplateNotFoundException(this.PAGE_TEMPLATE_NAME)
		}

		return new PageTemplateDTO(pageTemplate)
	}

	private async handleBannerSection(
		templateId: string,
		section: ImageSectionDTO,
	) {
		const { imageStoragePath } = this.config
		const results = await Promise.all(
			section.image_list.map(async (image) => {
				if (isURL(image.image_url)) {
					return
				}
				const url = await this.imageUploader.copyFromTempTo(
					image.image_url,
					`${imageStoragePath}/${templateId}/${
						section.name
					}/${randomInt(10000)}_${Date.now()}`,
				)
				image.image_url = url
			}),
		)
	}

	private async handleCategorySection(section: ImageSectionDTO) {
		const { categoryLinkFunc } = this.config
		section.image_list.forEach((image) => {
			image.link_url = categoryLinkFunc(image.link_url)
		})
	}

	private async handleFooterSection(
		templateId: string,
		section: FooterSectionDTO,
	) {
		const { imageStoragePath } = this.config
		const { background_image_url } = section
		if (isURL(background_image_url)) {
			return
		}
		try {
			const imageUrl = await this.imageUploader.copyFromTempTo(
				background_image_url,
				`${imageStoragePath}/${templateId}/${section.name}/${randomInt(
					10000,
				)}_${Date.now()}`,
			)
			section.background_image_url = imageUrl
		} catch (error) {
			this.logger.warn(error)
		}
	}
}
