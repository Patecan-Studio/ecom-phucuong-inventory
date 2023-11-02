import mongoose, { Schema } from 'mongoose'
import { PRODUCT_MODEL } from '../../constants'
import { ProductVariantStatus } from '../../domain'

export const productSchema = new Schema(
	{
		product_name: {
			type: String,
			trim: true,
			maxLength: 150,
			required: true,
			unique: true,
		},
		product_description: {
			type: String,
			required: true,
		},
		product_banner_image: {
			type: String,
			required: true,
		},
		product_slug: String, // --> Quan-Jean-cao-cap
		product_brand: {
			_id: { type: Schema.Types.ObjectId, ref: 'Brand' }, // Reference to the brand document
			brand_name: String, // Store the brand name denormalized
			brand_logoUrl: String, // Store the brand logo URL denormalized
		},
		product_categories: [
			{
				_id: { type: Schema.Types.ObjectId, ref: 'Category' }, // Reference to the brand document
				category_name: String, // Store the brand name denormalized
				category_logoUrl: String, // Store the brand logo URL denormalized
			},
		],
		product_height: {
			type: Number,
		},
		product_width: {
			type: Number,
		},
		product_length: {
			type: Number,
		},
		product_size_unit: {
			type: String,
			enum: ['cm', 'm', 'mm', 'inch'],
		},
		product_weight: {
			value: { type: Number },
			unit: {
				type: String,
				enum: ['kg', 'g'],
			},
		},
		product_variants: [
			{
				sku: String,
				color: {
					type: Schema.Types.Mixed,
					default: null,
					label: { type: String },
					value: { type: String },
				},
				material: String,
				price: Number,
				discount_price: Number,
				discount_percentage: Number,
				quantity: Number,
				image_list: [
					{
						imageName: String,
						imageUrl: String,
					},
				],
				status: {
					type: String,
					default: ProductVariantStatus.Active,
					required: false,
				},
			},
		],
		product_warranty: {
			type: Number,
			default: null,
		},
		product_isActive: { type: Boolean, default: true },
		isMarkedDelete: { type: Boolean, default: false },
		product_status: {
			type: String,
			index: true,
			select: true,
		},
	},
	{
		collection: 'Products',
		timestamps: true,
	},
)

productSchema.index({ product_name: 'text', product_description: 'text' })
productSchema.index({ product_status: 1 })

// productSchema.pre('save', async function (next) {
// 	for (let i = 0; i < this.product_variants.length; i++) {
// 		const variant = this.product_variants[i]
// 		if (variant.discount_price !== variant.price) {
// 			variant.discount_percentage = Math.round(
// 				(variant.discount_price / variant.price) * 100,
// 			)
// 		}
// 		if (variant.discount_percentage !== 0) {
// 			variant.discount_price = Math.round(
// 				(variant.price * (100 - variant.discount_percentage)) / 100,
// 			)
// 		}
// 	}

// 	next()
// })

export const ProductModel = mongoose.model(PRODUCT_MODEL, productSchema)
