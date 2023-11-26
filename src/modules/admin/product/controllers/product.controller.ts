import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	UseInterceptors,
} from '@nestjs/common'
import {
	CreateProductRequestDTO,
	CreateProductResponseDTO,
} from './dtos/product/create-product.dtos'
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProductDTO } from './dtos/product/product.dtos'
import {
	UpdateProductRequestDTO,
	UpdateProductResponseDTO,
} from './dtos/product/update-product.dtos'
import { ObjectIdParam } from './dtos/common.dto'
import { SuccessResponseDTO } from '@libs'
import { ProductService } from '../services'
import { ProductRepository } from '../database'
import {
	SearchProductsQueryDTO,
	SearchProductsResponseDTO,
} from './dtos/product/search-products.dtos'
import { AdminAuth } from '@modules/admin/auth'
import { ProductNotFoundException } from '../errors/product.errors'
import { GetProductByIdResponseDTO } from './dtos/product/get-by-id.dtos'

@Controller('v1/admin/products')
@ApiTags('Admin - Product')
@UseInterceptors(ClassSerializerInterceptor)
@AdminAuth('jwtToken')
export class ProductController {
	constructor(
		private readonly productService: ProductService,
		private readonly productRepo: ProductRepository,
	) {}

	@Post()
	@ApiResponse({
		status: 201,
		type: CreateProductResponseDTO,
	})
	async create(
		@Body() dto: CreateProductRequestDTO,
	): Promise<CreateProductResponseDTO> {
		const product = await this.productService.createProduct(dto)
		return new CreateProductResponseDTO({
			data: new ProductDTO(product.serialize()),
		})
	}

	@Get()
	@ApiResponse({
		status: 200,
		type: SearchProductsResponseDTO,
	})
	async searchProducts(
		@Query() query: SearchProductsQueryDTO,
	): Promise<SearchProductsResponseDTO> {
		const { q, page, page_size } = query
		const results = await this.productRepo.searchProductsByKeyword({
			keyword: q,
			page,
			page_size,
		})
		return new SearchProductsResponseDTO(results)
	}

	@Get(':id')
	@ApiResponse({
		status: 200,
		type: GetProductByIdResponseDTO,
	})
	async getProductById(
		@Param() param: ObjectIdParam,
	): Promise<GetProductByIdResponseDTO> {
		const productId = param.id
		const product = await this.productRepo.queryById(productId)
		if (!product) {
			throw new ProductNotFoundException(productId)
		}
		return new GetProductByIdResponseDTO({ data: product })
	}

	@Put('/:id')
	@ApiOkResponse({
		status: 200,
		type: UpdateProductResponseDTO,
	})
	async update(
		@Param() params: ObjectIdParam,
		@Body() dto: UpdateProductRequestDTO,
	): Promise<UpdateProductResponseDTO> {
		const product = await this.productService.updateProduct(params.id, dto)
		return new UpdateProductResponseDTO({
			data: new ProductDTO(product.serialize()),
		})
	}

	@Delete('/:id')
	@ApiResponse({
		status: 201,
		type: SuccessResponseDTO,
	})
	async deleteProductById(@Param() { id }: ObjectIdParam): Promise<void> {
		const products = await this.productService.deleteProduct(id)
		return
	}
}
