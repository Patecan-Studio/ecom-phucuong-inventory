import { Global, Module } from '@nestjs/common'
import { AUTH_MODULE_CONFIG } from './constants'
import { ConfigService } from '@nestjs/config'
import { WebHookAuthController } from './auth.controller'

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
	controllers: [WebHookAuthController],
})
export class AdminAuthModule {}
