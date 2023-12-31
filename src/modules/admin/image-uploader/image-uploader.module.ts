import { Global, Module } from '@nestjs/common'
import { ImageUploaderController } from './image-uploader.controller'
import { ImageUploader } from './image-uploader.service'
import { ConfigService } from '@nestjs/config'
import { IMAGE_UPLOADER_CONFIG } from './constants'

@Global()
@Module({
	controllers: [ImageUploaderController],
	providers: [
		ImageUploader,
		{
			provide: IMAGE_UPLOADER_CONFIG,
			useFactory: (configService: ConfigService) =>
				configService.get(IMAGE_UPLOADER_CONFIG),
			inject: [ConfigService],
		},
	],
	exports: [ImageUploader],
})
export class ImageUploaderModule {}
