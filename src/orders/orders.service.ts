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
      payment_method_id,
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
          user: { connect: { id: user_id } },
          PaymentMethod: { connect: { id: payment_method_id } }, // Conecta o método de pagamento ao pedido
          products: {
            create: productsWithStock.map((product: any) => ({
              product: { connect: { id: product.product_id } },
              quantity: Number(product.quantity),
            })),
          },
        },
        include: {
          products: {
            include: {
              product: true, // Inclui os dados do produto
            },
          },
          client: true, // Inclui os dados do cliente
          deliveryAddress: true, // Inclui os dados do endereço de entrega
          user: true, // Inclui os dados do usuário
          PaymentMethod: true, // Inclui os dados do método de pagamento
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

  async updateOrder(id: string, data: any): Promise<Order> {
    const {
      client_id,
      user_id,
      delivery_address_id,
      products,
      amount,
      paid,
      payment_method_id,
      deliveryDate,
      observations,
    } = data;

    const formattedDeliveryDate = deliveryDate
      ? new Date(deliveryDate)
      : undefined;

    // Verificar se o pedido existe
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Verificar o estoque dos produtos
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

    const updatedOrder = await this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          client: client_id ? { connect: { id: client_id } } : undefined,
          deliveryAddress: delivery_address_id
            ? { connect: { id: delivery_address_id } }
            : undefined,
          amount: amount ? Number(amount) : undefined,
          deliveryDate: formattedDeliveryDate,
          observations,
          paid,
          user: user_id ? { connect: { id: user_id } } : undefined,
          PaymentMethod: payment_method_id
            ? { connect: { id: payment_method_id } }
            : undefined,
          products: {
            deleteMany: {}, // Remove os produtos atuais
            create: productsWithStock.map((product: any) => ({
              product: { connect: { id: product.product_id } },
              quantity: Number(product.quantity),
            })),
          },
        },
        include: {
          products: {
            include: {
              product: true, // Inclui os dados do produto
            },
          },
          client: true, // Inclui os dados do cliente
          deliveryAddress: true, // Inclui os dados do endereço de entrega
          user: true, // Inclui os dados do usuário
          PaymentMethod: true, // Inclui os dados do método de pagamento
        },
      });

      // Atualizar o estoque dos produtos
      await Promise.all(
        productsWithStock.map((product: any) =>
          prisma.product.update({
            where: { id: product.product_id },
            data: { stock: { decrement: Number(product.quantity) } },
          }),
        ),
      );

      return updatedOrder;
    });

    return updatedOrder;
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        client: true, // Inclui os dados do cliente
        deliveryAddress: {
          include: {
            sector: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }, // Inclui os dados do endereço de entrega
        user: true, // Inclui os dados do usuário
        products: {
          include: {
            product: true, // Inclui os dados do produto
          },
        },
      },
    });

    return orders;
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true, // Inclui os dados do cliente
        deliveryAddress: true, // Inclui os dados do endereço de entrega
        user: true, // Inclui os dados do usuário
        products: {
          include: {
            product: true, // Inclui os dados do produto
          },
        },
        PaymentMethod: true, // Inclui os dados do método de pagamento
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
        client: true, // Inclui os dados do cliente
        deliveryAddress: true, // Inclui os dados do endereço de entrega
        user: true, // Inclui os dados do usuário
        products: {
          include: {
            product: true, // Inclui os dados do produto
          },
        },
        PaymentMethod: true, // Inclui os dados do método de pagamento
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
