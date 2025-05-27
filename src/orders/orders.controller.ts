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
    @Query('date') date: string,
    @Query('code') code: string,
    @Query('paid') paid: string,
  ) {
    // Converte os parâmetros para números, se necessário, e define valores padrão
    const pageNumber = page ? parseInt(page, 10) : 1;
    const perPageNumber = perPage ? parseInt(perPage, 10) : 50;

    return this.ordersService.findAll({
      page: pageNumber,
      perPage: perPageNumber,
      search: search || '',
      date: date || '',
      code: code ? parseInt(code, 10) : undefined,
      paid: paid ? paid === 'true' : undefined,
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

  @Get('revenue')
  async calculateRevenue(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('code') code: string,
    @Query('paid') paid: string,
    @Res() res: Response,
  ) {
    try {
      let revenueData;
      if (code) {
        revenueData = await this.ordersService.calculateRevenueByPeriodAndSeller(undefined, undefined, parseInt(code, 10));
      } else {
        revenueData = await this.ordersService.calculateRevenueByPeriodAndSeller(
          start,
          end,
          undefined,
          paid ? paid === 'true' : undefined,
        );
      }
      return res.status(200).json({
        status: 'success',
        data: {
          totalRevenue: revenueData.totalRevenue,
          totalRevenuePaid: revenueData.totalRevenuePaid,
          totalRevenueUnpaid: revenueData.totalRevenueUnpaid,
          breakdown: revenueData.breakdown,
          sellerRevenue: revenueData.sellerRevenue,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  @Patch('markAsPaid/:id')
  async markAsPaid(@Param('id') id: string, @Res() res: Response) {
    try {
      const order = await this.ordersService.markAsPaid(id);
      return res.status(200).json({
        status: 'success',
        message: 'Pedido marcado como pago com sucesso',
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
