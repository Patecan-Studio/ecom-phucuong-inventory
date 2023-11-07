import {
	DYNAMIC_SECTION_MODULE_CONFIG,
	DynamicSectionModuleConfig,
} from '@modules/admin/dynamic-section'

export default () => ({
	[DYNAMIC_SECTION_MODULE_CONFIG]: {
		categoryLinkFunc: (categoryId: string) => {
			return `${process.env.CLIENT_WEB_APP_URL}/products?category=${categoryId}`
		},
		imageStoragePath: 'dynamic-section',
	} as DynamicSectionModuleConfig,
})
