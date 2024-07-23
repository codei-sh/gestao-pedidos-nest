import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrder(data: any): Promise<Order> {
    const {
      client_id,
      user_id,
      delivery_address_id,
      products,
      amount,
      deliveryDate,
      observations,
    } = data;

    const formattedDeliveryDate = new Date(deliveryDate);

    // Verificar se a quantidade de cada produto está disponível em estoque
    const productsWithStock = await Promise.all(
      products.map(async (product: any) => {
        const dbProduct = await this.prisma.product.findUnique({
          where: { id: product.product_id },
        });
        if (!dbProduct || dbProduct.stock < product.quantity) {
          throw new Error(
            `Estoque insuficiente para o produto com código #${dbProduct.code}`,
          );
        }
        return { ...product, stock: dbProduct.stock };
      }),
    );

    const result = await this.prisma.$transaction(async (prisma) => {
      // Criar o novo pedido
      const newOrder = await prisma.order.create({
        data: {
          client: { connect: { id: client_id } },
          deliveryAddress: { connect: { id: delivery_address_id } },
          amount: Number(amount),
          deliveryDate: formattedDeliveryDate,
          observations,
          user: { connect: { id: user_id } }, // Conecta o usuário ao pedido
          products: {
            create: productsWithStock.map((product: any) => ({
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
        productsWithStock.map((product: any) =>
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
    const orders = await this.prisma.order.findMany({
      include: {
        client: true,
        deliveryAddress: true,
        user: true,
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

  async findByUser(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { user_id: userId },
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

    if (!orders || orders.length === 0) {
      throw new NotFoundException(
        `Orders for user with ID ${userId} not found`,
      );
    }

    return orders;
  }
}
