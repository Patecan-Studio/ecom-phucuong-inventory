import { Inject, Injectable, Logger } from '@nestjs/common'
import mongoose, { Model, Document } from 'mongoose'
import { CATEGORY_MODEL } from '../constants'
import { Category } from '../domain'
import { CategoryExistsException } from '../errors/category.errors'
import { categorySchema } from './models/category.model'

const CategoryModel = mongoose.model(CATEGORY_MODEL, categorySchema)

@Injectable()
export class CategoryRepository {
	private logger: Logger = new Logger(CategoryRepository.name)
	constructor() {}

	async create(category: Category): Promise<Category> {
		const cat = new CategoryModel({
			_id: new mongoose.Types.ObjectId(),
			...category,
		})
		try {
			const result = await cat.save()
			return result.toObject({
				versionKey: false,
				flattenObjectIds: true,
				transform: (doc, ret) => {
					delete ret.__v
					delete ret.isMarkedDelete
				},
			})
		} catch (error) {
			this.logger.error(error)
			throw new CategoryExistsException(category.category_name)
		}
	}

	async getNonExistCategoryNames(categoryIds: string[]): Promise<string[]> {
		const existingList = await CategoryModel.find({
			_id: {
				$in: categoryIds,
			},
		})
			.select('_id')
			.exec()
		if (existingList.length !== categoryIds.length) {
			return []
		}
		return categoryIds.filter((id) => {
			return (
				existingList.findIndex((category) =>
					category._id.equals(id),
				) === -1
			)
		})
	}

	async getById(id: string): Promise<Category> {
		const result = await CategoryModel.findById(id)
			.where({
				isMarkedDelete: false,
			})
			.select('-__v -isMarkedDelete -category_products')
		return result.toObject({
			flattenObjectIds: true,
		})
	}

	async update(category: Category): Promise<Category> {
		const result = await CategoryModel.findByIdAndUpdate(
			category._id,
			category,
			{
				new: true,
			},
		)
			.select('-__v -isMarkedDelete -category_products')
			.exec()
		return result.toObject({
			flattenObjectIds: true,
		})
	}

	async deleteById(id: string): Promise<boolean> {
		const result = await CategoryModel.findByIdAndUpdate(id, {
			isMarkedDelete: true,
		}).exec()
		return result ? true : false
	}

	async find(options: {
		category_name: string
		page: number
		page_size: number
	}): Promise<{
		items: Category[]
		page_size: number
		page: number
		total_page: number
		total_count: number
	}> {
		const { page = 1, page_size = 10, category_name } = options
		const filter = {
			isMarkedDelete: false,
			...(category_name && {
				$text: { $search: category_name },
			}),
		}
		const [categoryList, count] = await Promise.all([
			CategoryModel.find(filter)
				.select('-__v -category_products -isMarkedDelete')
				.skip((page - 1) * page_size)
				.limit(page_size)
				.exec(),
			CategoryModel.countDocuments(filter),
		])

		return {
			items: categoryList.map((cat) =>
				cat.toObject({
					flattenObjectIds: true,
				}),
			),
			page: page,
			page_size: page_size,
			total_page: Math.ceil(count / page_size),
			total_count: count,
		}
	}
}