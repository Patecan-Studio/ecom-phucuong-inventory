import { BaseException } from '@libs'

export class DuplicateProductNameException extends BaseException {
	public code = 'DUPLICATE_PRODUCT_NAME'
	constructor(product_name: string) {
		super(`Product name is duplicated: ${product_name}`)
	}
}

export class DuplicateProductVariantException extends BaseException {
	public code = 'DUPLICATE_PRODUCT_VARIANT'
	constructor(product_variant: string) {
		super(`Product variant is duplicated: ${product_variant}`)
	}
}

export class DuplicateProductVariantPropertyException extends BaseException {
	public code = 'DUPLICATE_PRODUCT_VARIANT_PROPERTY'
	constructor(property: string) {
		super(`Product variant property is duplicated: ${property}`)
	}
}

export class InvalidProductVariantException extends BaseException {
	public code = 'INVAID_PRODUCT_VARIANT'
	constructor(product_variant: string) {
		super(`Invalid product variant: ${product_variant}`)
	}
}

export class MissingProductVariantException extends BaseException {
	public code = 'MISSING_PRODUCT_VARIANT'
	constructor(sku: string) {
		super(`Product variant with ${sku} is missing`)
	}
}

export class InvalidProductVariantTypeException extends BaseException {
	public code = 'INVALID_PRODUCT_VARIANT_TYPE'
	constructor(valid: string, invalid: string) {
		super(`Invalid product variant type: ${valid} -> ${invalid}`)
	}
}

export class InsufficientProductVariantException extends BaseException {
	public code = 'INSUFFICIENT_PRODUCT_VARIANT'
	constructor() {
		super(`Insufficient product variant`)
	}
}

export class CreateProductFailedException extends BaseException {
	public code = 'CREATE_PRODUCT_FAILED'
	constructor() {
		super('Create product failed')
	}
}

export class DuplicateImageNameException extends BaseException {
	public code = 'DUPLICATE_IMAGE_NAME'
	constructor(image_name: string) {
		super(`Image name is duplicated: ${image_name}`)
	}
}

export class ProductNotFoundException extends BaseException {
	public code = 'PRODUCT_NOT_FOUND'
	constructor(productId: string) {
		super(`Product with id ${productId} not found`)
	}
}

export class InvalidProductBannerImageException extends BaseException {
	public code = 'INVALID_PRODUCT_BANNER_IMAGE'

	constructor(product_banner_image: string) {
		super(
			`Product banner image name '${product_banner_image}' does not exist in any image list`,
		)
	}
}

export class InvalidDiscountPriceException extends BaseException {
	public code = 'INVALID_DISCOUNT_PRICE'

	constructor(price: number, discount_price: number) {
		super(
			`Invalid discount price: ${discount_price}. Must be less than or equal to price: ${price}`,
		)
	}
}
