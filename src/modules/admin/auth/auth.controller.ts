import {
	Body,
	Controller,
	ForbiddenException,
	HttpCode,
	Inject,
	Logger,
	Post,
	UnauthorizedException,
} from '@nestjs/common'
import { AuthModuleConfig } from './interfaces'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { ApiTags } from '@nestjs/swagger'
import { AUTH_MODULE_CONFIG, USER_ROLES } from './constants'
import { AuthLoginRequest, AuthLoginResponse } from './dtos/login.dtos'

@Controller('/v1/admin/auth')
@ApiTags('Auth - Admin')
export class AuthController {
	private readonly logger = new Logger(AuthController.name)
	private readonly supabase: SupabaseClient

	constructor(
		@Inject(AUTH_MODULE_CONFIG)
		authConfig: AuthModuleConfig,
	) {
		const { supabaseConfig } = authConfig
		this.supabase = createClient(
			supabaseConfig.url,
			supabaseConfig.serviceRoleKey,
		)
	}

	@Post('login')
	@HttpCode(200)
	async login(@Body() body: AuthLoginRequest): Promise<AuthLoginResponse> {
		const { email, password } = body
		const { data, error } = await this.supabase.auth.signInWithPassword({
			email,
			password,
		})
		if (error) {
			this.logger.error(error)
			throw new UnauthorizedException('Invalid email or password')
		}
		const { user, session } = data
		if (user.user_metadata.role !== USER_ROLES.ADMIN) {
			throw new ForbiddenException(
				'You are not authorized to access this resource',
			)
		}
		return {
			resultCode: 200,
			data: {
				user,
				session,
			},
		}
	}
}
