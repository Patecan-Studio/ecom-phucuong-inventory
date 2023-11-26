import mongoose, { Schema } from 'mongoose'

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
		product_variants: [
			{
				_id: false,
				sku: String,
				property_list: [
					{
						_id: false,
						name: String,
						value: String,
						label: String,
					},
				],
				price: Number,
				discount_price: Number,
				discount_percentage: Number,
				quantity: Number,
				image_list: [
					{
						_id: false,
						imageName: String,
						imageUrl: String,
					},
				],
				status: {
					type: String,
					required: false,
				},
				metadata: {
					type: Schema.Types.Mixed,
					default: null,
				},
			},
		],
		product_warranty: {
			type: String,
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

export const ProductModel = mongoose.model('Product', productSchema)
