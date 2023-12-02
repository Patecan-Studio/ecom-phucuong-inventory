import { randomInt } from 'crypto'
import { CreateProductVariantDTO, ProductVariantStatus } from '../../domain'
import { getRandomAlphabetString, getRandomProductColor } from './random'

export class ProductVariantFactory {
	static createVariant(
		sku: string,
		property_list: string[],
		status: ProductVariantStatus = ProductVariantStatus.Active,
	): CreateProductVariantDTO {
		const imageName = getRandomAlphabetString(10)
		const dto: CreateProductVariantDTO = {
			sku,
			quantity: 1,
			price: 5000,
			discount_price: 5000,
			image_list: [
				{
					imageName: `temp/${imageName}`,
					imageUrl: `http://example/products/test/${imageName}`,
				},
			],
			status,
			color: null,
			material: null,
			measurement: null,
		}
		property_list.forEach((property) => {
			switch (property) {
				case 'color':
					dto.color = getRandomProductColor()
					break
				case 'material':
					dto.material = getRandomAlphabetString(10)
					break
				case 'measurement':
					dto.measurement = {
						height: randomInt(100),
						length: randomInt(100),
						width: randomInt(100),
						weight: randomInt(10),
						sizeUnit: 'cm',
						weightUnit: 'kg',
					}
					break
				default:
					throw new Error(`Invalid property name: ${property}`)
			}
		})

		return dto
	}

	static createVariantWithValue(
		sku: string,
		property_list: { name: string; value: any }[],
		status: ProductVariantStatus = ProductVariantStatus.Active,
	): CreateProductVariantDTO {
		const imageName = getRandomAlphabetString(10)
		const dto: CreateProductVariantDTO = {
			sku,
			quantity: 1,
			price: 5000,
			discount_price: 5000,
			image_list: [
				{
					imageName: `temp/${imageName}`,
					imageUrl: `http://example/products/test/${imageName}`,
				},
			],
			status,
			color: null,
			material: null,
			measurement: null,
		}

		property_list.forEach((property) => {
			dto[property.name] = property.value
		})

		return dto
	}
}
