import { NONE_VARIANT, Product, ProductVariantStatus } from '../domain'
import {
	DuplicateProductVariantException,
	InsufficientProductVariantException,
	InvalidDiscountPriceException,
	InvalidProductVariantException,
	InvalidProductVariantTypeException,
	MissingProductVariantException,
} from '../errors/product.errors'
import { ProductDTOBuilder } from './utils/product.factory'

describe('Product', () => {
	describe('When a product is created', () => {
		it('Throw InvalidDiscountPriceException if any variant has discount price bigger than price', () => {
			const productDTOBuilder = new ProductDTOBuilder()

			const productDTO = productDTOBuilder
				.createProduct()
				.withOneVariant(['color'])
				.withPrice(100, 200).result

			let error
			try {
				Product.createProduct(productDTO)
			} catch (e) {
				error = e
			} finally {
				expect(error).toBeInstanceOf(InvalidDiscountPriceException)
			}
		})

		describe('If product has no active variant', () => {
			it('Throw InsufficientProductVariantException if product status is Published', () => {
				const productDTOBuilder = new ProductDTOBuilder()

				const productDTO = productDTOBuilder
					.createProduct(true)
					.withOneVariant(
						['color'],
						ProductVariantStatus.Inactive,
					).result

				let error
				try {
					Product.createProduct(productDTO)
				} catch (e) {
					error = e
				} finally {
					expect(error).toBeInstanceOf(
						InsufficientProductVariantException,
					)
				}
			})

			it('Success if product status is Draft', () => {
				const productDTOBuilder = new ProductDTOBuilder()

				const productDTO = productDTOBuilder
					.createProduct(false)
					.withOneVariant(
						['color'],
						ProductVariantStatus.Inactive,
					).result

				let error
				try {
					Product.createProduct(productDTO)
				} catch (e) {
					error = e
				} finally {
					expect(error).toBeUndefined()
				}
			})
		})

		describe('If product has only one variant', () => {
			it('Success if property list in variant is empty', () => {
				const productDTOBuilder = new ProductDTOBuilder()

				const productDTO = productDTOBuilder
					.createProduct()
					.withOneVariant([], ProductVariantStatus.Active).result

				const product = Product.createProduct(productDTO)

				expect(product.variantType).toEqual(NONE_VARIANT.type)
			})

			it('Success if property list is not empty', () => {
				const productDTOBuilder = new ProductDTOBuilder()

				const productDTO = productDTOBuilder
					.createProduct()
					.withOneVariant(
						['color'],
						ProductVariantStatus.Active,
					).result

				const product = Product.createProduct(productDTO)
				expect(product.variantType).toEqual('color')
			})
		})

		describe('If product has multiple variants', () => {
			it('Throw InvalidProductVariantTypeException if product has different variant types', () => {
				const productDTOBuilder = new ProductDTOBuilder()

				const productDTO = productDTOBuilder
					.createProduct()
					.withMultipleVariantsOfDifferentType().result

				let error
				try {
					Product.createProduct(productDTO)
				} catch (e) {
					error = e
				} finally {
					expect(error).toBeInstanceOf(
						InvalidProductVariantTypeException,
					)
				}
			})

			it('Throw DuplicateProductVariantException if product variants have duplicate SKU', () => {
				const productDTOBuilder = new ProductDTOBuilder()
				const productDTO = productDTOBuilder
					.createProduct()
					.withDuplicateVariantSKU('SKU01').result

				let error
				try {
					Product.createProduct(productDTO)
				} catch (e) {
					error = e
				} finally {
					expect(error).toBeInstanceOf(
						DuplicateProductVariantException,
					)
				}
			})

			it('Throw DuplicateProductVariantException if product variants have duplicated variant value', () => {
				const productDTOBuilder = new ProductDTOBuilder()
				const productDTO = productDTOBuilder
					.createProduct()
					.withDuplicateVariantValue('Red', 'Leather').result

				let error
				try {
					Product.createProduct(productDTO)
				} catch (e) {
					error = e
				} finally {
					expect(error).toBeInstanceOf(
						DuplicateProductVariantException,
					)
				}
			})

			it('Otherwise, create product successfully', () => {
				const productDTOBuilder = new ProductDTOBuilder()

				const productDTO = productDTOBuilder
					.createProduct()
					.withVariant('SKU01', ['color', 'material', 'measurement'])
					.withVariant('SKU02', ['color', 'material', 'measurement'])
					.withVariant('SKU03', [
						'color',
						'material',
						'measurement',
					]).result

				let error
				try {
					const product = Product.createProduct(productDTO)
					expect(product.variantType).toContain('color')
					expect(product.variantType).toContain('material')
					expect(product.variantType).toContain('measurement')
				} catch (e) {
					error = e
				} finally {
					expect(error).toBeUndefined()
				}
			})
		})
	})

	describe('When a product is updated', () => {
		it('Throw InvalidProductVariantException if number of updated variant is smaller than variants in product', () => {
			const productDTOBuilder = new ProductDTOBuilder()

			const productDTO = productDTOBuilder
				.createProduct()
				.withVariant('SKU01', ['color'])
				.withVariant('SKU02', ['color']).result

			const product = Product.createProduct(productDTO)

			let error
			try {
				product.update({
					...productDTO,
					product_variants: productDTO.product_variants.slice(0, 1),
				})
			} catch (e) {
				error = e
			} finally {
				expect(error).toBeInstanceOf(MissingProductVariantException)
			}
		})

		it('Update successfully if number of updated variant is equal to variants in product', () => {
			const productDTOBuilder = new ProductDTOBuilder()

			const productDTO = productDTOBuilder
				.createProduct()
				.withVariant('SKU01', ['color'])
				.withVariant('SKU02', ['color']).result

			const product = Product.createProduct(productDTO)

			let error
			try {
				productDTO.product_variants[0].color = {
					value: 'Update red',
					label: 'Update red',
				}
				product.update({
					...productDTO,
					product_variants: productDTO.product_variants,
				})
			} catch (e) {
				error = e
			} finally {
				expect(error).toBeUndefined()
			}
		})

		it('Update successfully if number of updated variant is greater than variants in product', () => {
			const productDTOBuilder = new ProductDTOBuilder()

			const productDTO = productDTOBuilder
				.createProduct()
				.withVariant('SKU01', ['color', 'material'])
				.withVariant('SKU02', ['color', 'material']).result

			const product = Product.createProduct(productDTO)

			let error
			try {
				productDTO.product_variants[0].color = {
					value: 'Update red',
					label: 'Update red',
				}
				productDTO.product_variants.push({
					sku: 'SKU03',
					color: {
						value: 'Update red',
						label: 'Update red',
					},
					material: 'Update material',
					measurement: null,
					price: 100,
					discount_price: 100,
					quantity: 100,
					image_list: [],
					status: ProductVariantStatus.Active,
				})
				product.update({
					...productDTO,
					product_variants: productDTO.product_variants,
				})

				const serialize = product.serialize()

				expect(product.variantType).toEqual('color#material')
				expect(serialize.product_variants.length).toEqual(3)
			} catch (e) {
				error = e
			} finally {
				expect(error).toBeUndefined()
			}
		})
	})
})
