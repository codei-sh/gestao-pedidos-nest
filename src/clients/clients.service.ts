import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}
  async registerClient(data: any) {
    const { name, cpf, phone, address, selectedSector } = data;

    return this.prisma.$transaction(async (prisma) => {
      // Criação do cliente
      const client = await prisma.client.create({
        data: {
          name,
          cpf,
        },
      });

      // Criação do endereço
      const addressRecord = await prisma.address.create({
        data: {
          zip_code: address.zip_code,
          street: address.street,
          number: address.number,
          complement: address.complement,
          city: address.city,
          state: address.state,
          table: 'clients',
          table_id: client.id,
          sector_id: selectedSector.id,
        },
      });

      // Criação dos telefones

      const phoneCreated = await prisma.phones.create({
        data: {
          phone: phone,
          type_phone_id: '2a5615d0-60e3-4e8a-b86e-2f0571f5c1ef',
          table: 'clients',
          table_id: client.id,
        },
      });

      return { client, address: addressRecord, phone: phoneCreated };
    });
  }
}
