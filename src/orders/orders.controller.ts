import { Controller, Post, Body, Get, Param, Res, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('register')
  async registerOrder(@Body() data: any, @Res() res: Response) {
    try {
      const order = await this.ordersService.registerOrder(data);
      return res.status(201).json({
        status: 'success',
        message: 'Pedido registrado com sucesso',
        data: order,
      });
    } catch (error) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
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

  @Patch('update/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() data: any,
    @Res() res: Response,
  ) {
    try {
      const order = await this.ordersService.updateOrder(id, data);
      return res.status(200).json({
        status: 'success',
        message: 'Pedido atualizado com sucesso',
        data: order,
      });
    } catch (error) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
