import { Controller, Get } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get('index')
  async findAll() {
    return this.paymentMethodsService.findAll();
  }
}
