import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}
  async registerClient(data: any) {
    const { name, cpf, referenceDay, phone, address, selectedSector } = data;

    return this.prisma.$transaction(async (prisma) => {
      // Criação do cliente
      const client = await prisma.client.create({
        data: {
          name,
          cpf,
          reference_day: referenceDay,
        },
      });

      // Criação do endereço
      const addressRecord = await prisma.address.create({
        data: {
          zip_code: address.zip_code,
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
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
          type_phone_id: 'cef8eb9d-c167-4725-9ab1-2f7b4f41f8ee',
          table: 'clients',
          table_id: client.id,
        },
      });

      return { client, address: addressRecord, phone: phoneCreated };
    });
  }

  async findAllClients() {
    // Buscar todos os clientes
    const clients = await this.prisma.client.findMany();

    // Buscar os endereços e telefones associados a cada cliente
    const clientIds = clients.map((client) => client.id);

    const addresses = await this.prisma.address.findMany({
      where: {
        table: 'clients',
        table_id: {
          in: clientIds,
        },
      },
    });

    const phones = await this.prisma.phones.findMany({
      where: {
        table: 'clients',
        table_id: {
          in: clientIds,
        },
      },
    });

    // Associar endereços e telefones aos clientes
    return clients.map((client) => {
      return {
        ...client,
        addresses: addresses.filter(
          (address) => address.table_id === client.id,
        ),
        phones: phones.filter((phone) => phone.table_id === client.id),
      };
    });
  }
}
