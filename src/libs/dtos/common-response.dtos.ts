import { ApiProperty } from '@nestjs/swagger'

export class SuccessResponseDTO {
	@ApiProperty()
	resultCode: string | number

	@ApiProperty()
	message: string

	constructor(props: any) {
		Object.assign(this, props)
	}
}

export class ErrorResponseDTO {
	@ApiProperty()
	resultCode: string

	@ApiProperty()
	code: string

	@ApiProperty()
	message: string
}
