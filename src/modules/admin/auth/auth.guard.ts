import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { Request } from 'express'
import { AuthModuleConfig, AuthTokenPayload, AuthType } from './interfaces'
import { UserUnauthorizedException } from './errors'
import { API_KEY_HEADER, AUTH_MODULE_CONFIG, USER_ROLES } from './constants'

@Injectable()
class ApiKeyAuthGuardClass implements CanActivate {
	constructor(
		@Inject(AUTH_MODULE_CONFIG)
		private readonly authGuardConfig: AuthModuleConfig,
	) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		if (this.authGuardConfig.bypassApiKey) {
			return true
		}
		const req = context.switchToHttp().getRequest() as Request

		const token = this.extractTokenFromHeader(req)

		if (!token || (token && token !== this.authGuardConfig.apiKey)) {
			throw new UserUnauthorizedException('Invalid token')
		}

		return true
	}

	private extractTokenFromHeader(req: Request) {
		const [type, token] =
			(req.headers[API_KEY_HEADER] as string)?.split(' ') ?? []
		if (type && type === 'Bearer') {
			return token
		}
		return type // If no type is specified, `type` is token
	}
}

@Injectable()
class SupabaseGuardClass implements CanActivate {
	private readonly logger = new Logger(SupabaseGuardClass.name)
	constructor(
		@Inject(AUTH_MODULE_CONFIG)
		private readonly authGuardConfig: AuthModuleConfig,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const {
			bypassApiKey,
			supabaseConfig: { jwtSecret: apiSecret },
		} = this.authGuardConfig
		if (bypassApiKey) {
			return true
		}
		const req = context.switchToHttp().getRequest() as Request

		const token = this.extractTokenFromHeader(req)

		if (!token) {
			throw new UserUnauthorizedException('Invalid token')
		}

		let payload: AuthTokenPayload
		try {
			payload = (await jwt.verify(token, apiSecret)) as AuthTokenPayload
		} catch (error) {
			this.logger.error(error)
			throw new UserUnauthorizedException('Invalid token')
		}

		if (payload.user_metadata?.role !== USER_ROLES.ADMIN) {
			throw new UserUnauthorizedException('Unauthorized')
		}

		return true
	}

	private extractTokenFromHeader(req: Request) {
		const [type, token] =
			(req.headers[API_KEY_HEADER] as string)?.split(' ') ?? []
		return type === 'Bearer' ? token : undefined
	}
}

export const AuthGuard = (type: AuthType) => {
	switch (type) {
		case 'apiKey':
			return ApiKeyAuthGuardClass
		case 'jwtToken':
		case 'supabase':
			return SupabaseGuardClass
		default:
			throw new Error('Invalid auth type')
	}
}
