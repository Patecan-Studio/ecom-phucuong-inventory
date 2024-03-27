import {
	Body,
	Controller,
	BadRequestException,
	Inject,
	Logger,
	Post,
	ForbiddenException,
	InternalServerErrorException,
} from '@nestjs/common'
import { AuthModuleConfig, SupabaseRecordInsertWebHook } from './interfaces'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { ApiTags } from '@nestjs/swagger'
import { AUTH_MODULE_CONFIG, USER_ROLES } from './constants'
import { SuccessResponseDTO } from '@libs'
import { AdminAuth } from './decorators'

@Controller('/v1/admin/auth/webhook')
@AdminAuth('apiKey')
@ApiTags('Webhook')
export class WebHookAuthController {
	private readonly logger = new Logger(WebHookAuthController.name)
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

	@Post('assignAdminRole')
	async assignAdminRole(@Body() body: SupabaseRecordInsertWebHook) {
		this.logger.log('Hook assignAdminRole is triggered')
		const user = body.record
		const { role: userRole, role_updated_at } = user.raw_user_meta_data
		if (userRole) {
			const errMsg = `User with ID ${user.id} is already assigned with role ${userRole} at ${role_updated_at}`
			this.logger.error(errMsg)
			throw new ForbiddenException(errMsg)
		}
		if (user.raw_app_meta_data.provider !== 'email') {
			const errorMsg = `Only user with email provider can be assigned with role '${USER_ROLES.ADMIN}'`
			this.logger.error(errorMsg)
			throw new ForbiddenException(errorMsg)
		}
		const { data, error } = await this.supabase.auth.admin.updateUserById(
			user.id,
			{
				user_metadata: {
					...user.raw_user_meta_data,
					role: USER_ROLES.ADMIN,
					role_updated_at: new Date().toString(),
				},
			},
		)

		if (error) {
			this.logger.error(error)
			throw new InternalServerErrorException(error.message)
		}

		this.logger.log(
			`User with ID '${user.id}' is successfully assigned with role '${USER_ROLES.ADMIN}'`,
		)

		return new SuccessResponseDTO({
			data: data.user,
		})
	}
}
