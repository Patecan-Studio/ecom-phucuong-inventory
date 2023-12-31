import { ValidateMongoObjectId } from '@libs'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty, Validate } from 'class-validator'

export class ObjectIdParam {
	@ApiProperty()
	@Validate(ValidateMongoObjectId)
	@IsNotEmpty()
	id: string
}

export class CategoryImage {
	@ApiProperty()
	imageName: string

	@ApiProperty()
	imageUrl: string
}

export class CategoryDTO {
	@ApiProperty()
	_id: string

	@ApiProperty()
	category_name: string

	@ApiProperty({
		required: false,
	})
	category_description: string

	@ApiProperty({
		required: false,
	})
	category_logoUrl: string

	@ApiProperty({
		type: [CategoryImage],
	})
	category_images: CategoryImage[]

	constructor(props: any) {
		Object.assign(this, props)
	}
}

export class CategoryTreeDTO extends PartialType(CategoryDTO) {
	@ApiProperty({
		required: false,
		type: [CategoryTreeDTO],
	})
	child_category_list?: CategoryTreeDTO[]

	@ApiProperty()
	level: number
}
