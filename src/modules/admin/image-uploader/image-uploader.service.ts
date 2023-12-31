import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { ImageUploaderConfig } from './interfaces'
import { RemoveFileFailedException, UploadFileFailedException } from './errors'
import { Inject, Logger } from '@nestjs/common'
import { IMAGE_UPLOADER_CONFIG } from './constants'
import { isURL } from 'class-validator'

export class ImageUploader {
	private readonly logger = new Logger(ImageUploader.name)
	private readonly PUBLIC_URL_PATH = 'storage/v1/object/public'
	private readonly supabaseClient: SupabaseClient
	constructor(
		@Inject(IMAGE_UPLOADER_CONFIG)
		private readonly config: ImageUploaderConfig,
	) {
		this.supabaseClient = createClient(
			config.supabaseUrl,
			config.supabaseKey,
		)
	}

	async upload(image_type: string, file: Express.Multer.File) {
		const { supabaseUrl, bucketName } = this.config

		// Upload the image to Supabase storage
		let fileName: string
		const parts = file.originalname.split('.')
		if (parts.length === 1) {
			fileName = parts[0].concat(`_${Date.now()}`)
		} else {
			const ext = parts.pop()
			fileName = parts
				.join('.')
				.concat(`_${Date.now()}`)
				.concat(`.${ext}`)
		}
		fileName = fileName.replace(' ', '_')
		const path = `${image_type}/${fileName}`
		const { data, error } = await this.supabaseClient.storage
			.from(bucketName)
			.upload(path, file.buffer, {
				contentType: file.mimetype,
			})

		if (error) {
			throw new UploadFileFailedException(error.message)
		}

		this.logger.debug(
			`File uploaded to Supabase storage successfully. Path: ${path}`,
		)

		return `${supabaseUrl}/${this.PUBLIC_URL_PATH}/${bucketName}/${path}`
	}

	async copyFromTempTo(
		fromPath: string,
		destinationPath: string,
		overwriteIfExists = false,
	) {
		const { bucketName, supabaseUrl, defaultPath, tempPath } = this.config

		if (
			!fromPath.startsWith(tempPath) &&
			!fromPath.startsWith(defaultPath)
		) {
			throw new UploadFileFailedException(
				`Path of image must start with ${tempPath} or ${defaultPath}`,
			)
		}

		const { error } = await this.supabaseClient.storage
			.from(bucketName)
			.copy(fromPath, destinationPath)

		if (error) {
			this.logger.warn(error)
			if (error.message !== 'The resource already exists') {
				throw new UploadFileFailedException(error.message)
			}
			if (overwriteIfExists) {
				this.logger.debug('Overwrite image in path ' + destinationPath)
				await this.supabaseClient.storage
					.from(bucketName)
					.remove([destinationPath])
				const { error: reuploadError } =
					await this.supabaseClient.storage
						.from(bucketName)
						.copy(fromPath, destinationPath)

				if (reuploadError) {
					throw new UploadFileFailedException(error.message)
				}
			}
		}

		return new URL(
			`${supabaseUrl}/${this.PUBLIC_URL_PATH}/${bucketName}/${destinationPath}`,
		).toString()
	}

	async removeImages(imageList: string[], isFullUrl = true) {
		const { bucketName, supabaseUrl } = this.config

		let imagePathList
		if (isFullUrl) {
			const supabaseBasePath = `${supabaseUrl}/${this.PUBLIC_URL_PATH}/${bucketName}/`
			imagePathList = imageList.map((imageUrl) => {
				return imageUrl.slice(supabaseBasePath.length)
			})
		} else {
			imagePathList = imageList
		}

		const { error } = await this.supabaseClient.storage
			.from(bucketName)
			.remove(imagePathList)

		if (error) {
			throw new RemoveFileFailedException(error.message)
		}

		return true
	}

	async removeImagesByFolder(folder: string) {
		const { bucketName } = this.config

		const { error, data } = await this.supabaseClient.storage
			.from(bucketName)
			.list(folder)

		if (error) {
			throw new RemoveFileFailedException(error.message)
		}

		const imagePathList = data.map((item) => `${folder}/${item.name}`)

		const { error: removeError } = await this.supabaseClient.storage
			.from(bucketName)
			.remove(imagePathList)

		if (removeError) {
			throw new RemoveFileFailedException(removeError.message)
		}

		return true
	}
}
