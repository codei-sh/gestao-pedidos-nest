import { Controller, Post, Body } from '@nestjs/common';
import { ClientsService } from './clients.service';

interface RegisterClientDto {
  name: string;
  cpf?: string;
  phone: string;
  address: {
    zip_code: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
  };
  selected_sector: any;
}

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('register')
  async registerClient(@Body() registerClientDto: RegisterClientDto) {
    return this.clientsService.registerClient(registerClientDto);
  }
}
