export enum ProductStatus {
	Draft = 'Draft',
	Published = 'Published',
}

export interface ProductImage {
	imageName: string
	imageUrl: string
}

export interface ProductColor {
	label: string
	value: string
}
export interface ProductWeight {
	value: number
	unit: string
}

export enum ProductVariantStatus {
	Active = 'Active',
	Inactive = 'Inactive',
}

export const NONE_VARIANT = {
	type: 'None',
	value: 'None',
}
