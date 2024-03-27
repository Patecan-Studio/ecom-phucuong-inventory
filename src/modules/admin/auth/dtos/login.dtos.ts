import { SuccessResponseDTO } from '@libs'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class AuthLoginRequest {
	@ApiProperty()
	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsNotEmpty()
	@ApiProperty()
	password: string
}

export class AuthLoginResponse extends PartialType(SuccessResponseDTO) {
	@ApiProperty()
	data: {
		user: any
		session: any
	}

	constructor(props: any) {
		super(...props)
	}
}
