import { Global, Module } from '@nestjs/common'
import { AUTH_MODULE_CONFIG } from './constants'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { WebHookAuthController } from './auth-webhook.controller'

@Global()
@Module({
	providers: [
		{
			provide: AUTH_MODULE_CONFIG,
			useFactory: (configService: ConfigService) =>
				configService.get(AUTH_MODULE_CONFIG),
			inject: [ConfigService],
		},
	],
	exports: [AUTH_MODULE_CONFIG],
	controllers: [WebHookAuthController, AuthController],
})
export class AdminAuthModule {}
