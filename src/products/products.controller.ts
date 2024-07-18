import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('index')
  async findAll() {
    return this.productsService.findAll();
  }

  @Post('add-to-stock')
  async addToStock(@Body() body: any) {
    return this.productsService.addToStock(body);
  }
}
