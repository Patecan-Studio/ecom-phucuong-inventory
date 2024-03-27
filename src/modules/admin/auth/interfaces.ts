import { ApiProperty } from '@nestjs/swagger'

export interface AuthModuleConfig {
	apiKey: string
	bypassApiKey?: boolean
	supabaseConfig: {
		url: string
		serviceRoleKey: string
		jwtSecret: string
	}
}

export type AuthType =
	| 'apiKey'
	| 'supabase'
	// @deprecated. Use 'supabase' instead
	| 'jwtToken'

export interface AuthTokenPayload {
	sub: string
	email: string
	phone: string
	app_metadata: {
		provider: string
		providers: string[]
	}
	user_metadata: {
		role: string
	}
	role: string
	session_id: string
}

export class SupabaseRecordInsertWebHook {
	@ApiProperty()
	type: 'INSERT'
	@ApiProperty()
	table: 'users'

	@ApiProperty()
	record: {
		id: '7e06c54d-4e51-46a6-86c0-18bbf41bc918'
		aud: 'authenticated'
		role: ''
		email: 'test13112301@gmail.com'
		phone: null
		created_at: '2023-11-13T14:40:30.505834+00:00'
		deleted_at: null
		invited_at: null
		updated_at: '2023-11-13T14:40:30.505834+00:00'
		instance_id: '00000000-0000-0000-0000-000000000000'
		is_sso_user: false
		banned_until: null
		confirmed_at: null
		email_change: ''
		phone_change: ''
		is_super_admin: null
		recovery_token: ''
		last_sign_in_at: null
		recovery_sent_at: null
		raw_app_meta_data: {
			provider: 'email'
			providers: ['email']
		}
		confirmation_token: ''
		email_confirmed_at: null
		encrypted_password: '$2a$10$N.XoVZT.VFGBM1Y8nmliCOvfhQ2UN3pHWX0NgLZKZmlBNqCmC7156'
		phone_change_token: ''
		phone_confirmed_at: null
		raw_user_meta_data: Record<string, any>
		confirmation_sent_at: null
		email_change_sent_at: null
		phone_change_sent_at: null
		email_change_token_new: ''
		reauthentication_token: ''
		reauthentication_sent_at: null
		email_change_token_current: ''
		email_change_confirm_status: 0
	}
	schema: 'auth'
	old_record: null
}
