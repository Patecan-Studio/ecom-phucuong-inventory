import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsOptional, IsArray, IsNotEmpty, IsNumber } from 'class-validator'

import { DateStringToTimestamp, SuccessResponseDTO } from '@libs'
import { CommonImage } from '../../../../../../libs/dtos/common-image.dtos'

export class CampaignDTO {
	@ApiProperty()
	_id: string

	@ApiProperty()
	@IsNotEmpty()
	campaign_name: string

	@ApiProperty()
	campaign_content: string

	@ApiProperty({
		required: false,
		type: [CommonImage],
	})
	@IsOptional()
	@IsArray()
	@Type(() => CommonImage)
	campaign_images: CommonImage[] = []

	@ApiProperty()
	campaign_link: string

	@ApiProperty()
	campaign_isActive: boolean

	@ApiProperty()
	isMarkedDelete: boolean

	@ApiProperty()
	@Transform(({ value }) => value?.getTime?.() || null)
	startDate?: Date

	@ApiProperty()
	@Transform(({ value }) => value?.getTime?.() || null)
	endDate?: Date

	@ApiProperty({
		type: Number,
	})
	@DateStringToTimestamp()
	createdAt: Date

	@ApiProperty({
		type: Number,
	})
	@DateStringToTimestamp()
	updatedAt: Date

	constructor(props: any) {
		Object.assign(this, props)
	}
}

export class CreateCampaignRequestDTO {
	@ApiProperty()
	@IsNotEmpty()
	campaign_name: string

	@ApiProperty()
	campaign_content: string

	@ApiProperty({
		required: false,
		type: [CommonImage],
	})
	@IsOptional()
	@IsArray()
	@Type(() => CommonImage)
	campaign_images: CommonImage[] = []

	@ApiProperty()
	campaign_link: string

	@ApiProperty()
	campaign_isActive: boolean

	@ApiProperty()
	isMarkedDelete: boolean

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	startDate: number

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	endDate: number
}

export class CreateCampaignResponseDTO extends PartialType(SuccessResponseDTO) {
	@ApiProperty({
		type: CampaignDTO,
	})
	@Type(() => CampaignDTO)
	data: CampaignDTO

	constructor(props: any) {
		super(props)
		Object.assign(this, props)
	}
}
