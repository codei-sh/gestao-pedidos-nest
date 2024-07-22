import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('register')
  async registerOrder(@Body() data: any) {
    return this.ordersService.registerOrder(data);
  }

  @Get('index')
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:id')
  async findByUser(@Param('id') id: string) {
    return this.ordersService.findByUser(id);
  }

  @Get('show/:id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
