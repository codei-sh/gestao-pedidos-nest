import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrder(data: any): Promise<Order> {
    const {
      client_id,
      delivery_address_id,
      products,
      amount,
      deliveryDate,
      observations,
      // Novo campo user_id
    } = data;

    const formattedDeliveryDate = new Date(deliveryDate);

    // Inicia uma transação para garantir que a criação do pedido e a atualização do estoque sejam feitas atomically
    const result = await this.prisma.$transaction(async (prisma) => {
      // Cria o pedido
      const newOrder = await prisma.order.create({
        data: {
          client: { connect: { id: client_id } },
          deliveryAddress: { connect: { id: delivery_address_id } },
          amount: Number(amount),
          deliveryDate: formattedDeliveryDate,
          observations,
          user: { connect: { id: 'ca2015ec-3748-476f-8594-572d9930fb43' } }, // Conecta o usuário ao pedido
          products: {
            create: products.map((product: any) => ({
              product: { connect: { id: product.product_id } },
              quantity: Number(product.quantity),
            })),
          },
        },
        include: {
          products: true,
        },
      });

      // Atualiza o estoque dos produtos
      await Promise.all(
        products.map((product: any) =>
          prisma.product.update({
            where: { id: product.product_id },
            data: { stock: { decrement: Number(product.quantity) } },
          }),
        ),
      );

      return newOrder;
    });

    return result;
  }

  async findAll(): Promise<Order[]> {
    // Buscar todos os pedidos
    const orders = await this.prisma.order.findMany({
      include: {
        client: true,
        deliveryAddress: true,
        user: true, // Inclui informações do usuário
      },
    });

    return orders;
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        deliveryAddress: true,
        user: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
