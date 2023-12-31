import {
	Body,
	Controller,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ImageUploader } from './image-uploader.service'
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { MoveImageDTO, UploadImageDTO } from './image-uploader.dtos'
import { AdminAuth } from '@modules/admin/auth'

@Controller('/v1/admin/image')
@ApiTags('Admin - Image Upload')
@AdminAuth('jwtToken')
export class ImageUploaderController {
	constructor(private readonly imageUploader: ImageUploader) {}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file'))
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				image_type: { type: 'string' },
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: UploadImageDTO,
	) {
		const fileUrl = await this.imageUploader.upload(dto.image_type, file)
		return {
			fileUrl,
		}
	}

	@Post('/move')
	async moveImage(@Body() dto: MoveImageDTO) {
		await this.imageUploader.copyFromTempTo(dto.fileName, dto.destination)
	}
}
