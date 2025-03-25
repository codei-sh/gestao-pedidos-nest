import { Controller, Post, Body, Get, Param, Res, Patch, Query } from '@nestjs/common';
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
  async findAll(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
    @Query('search') search: string,
  ) {
    // Converte os parâmetros para números, se necessário, e define valores padrão
    const pageNumber = page ? parseInt(page, 10) : 1;
    const perPageNumber = perPage ? parseInt(perPage, 10) : 50;

    return this.ordersService.findAll({
      page: pageNumber,
      perPage: perPageNumber,
      search: search || '',
    });
  }

  @Get('user/:id')
  async findByUser(@Param('id') id: string) {
    return this.ordersService.findByUser(id);
  }

  @Get('show/:id')
  async findOne(@Param('id') id: string) {
    const test = await this.ordersService.findOne(id);

    return test;
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
