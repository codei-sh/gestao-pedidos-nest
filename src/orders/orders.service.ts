import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { Prisma } from '@prisma/client';


import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  private normalizeDateToDateTime(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

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

    const normalizedDeliveryDate = this.normalizeDateToDateTime(deliveryDate);

    // Verificar se o pedido existe
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Verificar o estoque dos produtos
    for (const product of products) {
      const dbProduct = await this.prisma.product.findUnique({
        where: { id: product.product_id },
      });
      if (!dbProduct || dbProduct.stock < product.quantity) {
        throw new Error(
          `Estoque insuficiente para o produto com código #${dbProduct.code}`,
        );
      }
    }

    // Atualizar o pedido
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        client: client_id ? { connect: { id: client_id } } : undefined,
        deliveryAddress: delivery_address_id
          ? { connect: { id: delivery_address_id } }
          : undefined,
        amount: amount ? Number(amount) : undefined,
        deliveryDate: normalizedDeliveryDate,
        observations,
        paid,
        user: user_id ? { connect: { id: user_id } } : undefined,
        PaymentMethod: payment_method_id
          ? { connect: { id: payment_method_id } }
          : undefined,
        products: {
          deleteMany: {}, // Remove os produtos atuais
          create: products.map((product: any) => ({
            product: { connect: { id: product.product_id } },
            quantity: Number(product.quantity),
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        client: true,
        deliveryAddress: true,
        user: true,
        PaymentMethod: true,
      },
    });

    // Restaurar o estoque dos produtos removidos
    for (const orderProduct of order.products) {
      await this.prisma.product.update({
        where: { id: orderProduct.product_id },
        data: { stock: { increment: orderProduct.quantity } },
      });
    }

    // Atualizar o estoque dos novos produtos
    for (const product of products) {
      await this.prisma.product.update({
        where: { id: product.product_id },
        data: { stock: { decrement: Number(product.quantity) } },
      });
    }

    return updatedOrder;
  }

  async findAll({
    page = 1,
    perPage = 50,
    search = '',
  }: {
    page?: number;
    perPage?: number;
    search?: string;
  }): Promise<{ orders: Order[]; total: number }> {
    const skip = (page - 1) * perPage;
    const take = perPage;
  
    const where: any = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { client: { is: { name: { contains: search, mode: 'insensitive' } } } },
            { deliveryAddress: { is: { street: { contains: search, mode: 'insensitive' } } } },
            { user: { is: { name: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {};
  
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          client: true,
          deliveryAddress: {
            include: {
              sector: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: true,
          products: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          deliveryDate: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
  
    return { orders, total };
  }
  
  
  

  async findOne(id: string): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        user: true,
        deliveryAddress: {
          include: {
            sector: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        PaymentMethod: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const phones = await this.prisma.phones.findMany({
      where: {
        table: 'clients',
        table_id: order.client.id,
      },
      select: {
        id: true,
        phone: true,
        phoneType: {
          select: {
            name: true,
          },
        },
      },
    });
    console.log(phones);
    return { ...order, client: { ...order.client, phones } };
  }

  async findByUser(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { user_id: userId },
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
        PaymentMethod: true, // Inclui os dados do método de pagamento
      },
      orderBy: {
        createdAt: 'desc', // Ordena pelos registros mais recentes
      },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException(
        `Orders for user with ID ${userId} not found`,
      );
    }

    return orders;
  }

  async findByMonthAndYear(month: number, year: number): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        AND: [
          {
            createdAt: {
              gte: new Date(year, month - 1, 1),
            },
          },
          {
            createdAt: {
              lt: new Date(year, month, 1),
            },
          },
        ],
      },
      include: {
        client: true,
        deliveryAddress: {
          include: {
            sector: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: true,
        products: {
          include: {
            product: true,
          },
        },
        PaymentMethod: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Orders for ${month}/${year} not found`);
    }

    return orders;
  }
  async calculateRevenueByPeriodAndSeller(startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Query 1: Busca os pedidos (um registro por pedido)
    const ordersResult = await this.prisma.$queryRaw<Array<{
      order_id: string;
      order_code: number;
      order_amount: number;
      deliveryDate: Date | null;
      status: string;
      seller_id: string;
      seller_name: string;
      client_id: string;
      client_name: string;
      client_phones: string | null;
    }>>`
      SELECT 
        o.id AS order_id,
        o.code AS order_code,
        o.amount AS order_amount,
        o.deliveryDate,
        o.status,
        u.id AS seller_id,
        u.name AS seller_name,
        c.id AS client_id,
        c.name AS client_name,
        GROUP_CONCAT(DISTINCT CONCAT(ph.phone, ' (', pt.name, ')') SEPARATOR ', ') AS client_phones
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN clients c ON o.client_id = c.id
      LEFT JOIN phones ph ON ph.table = 'clients' AND ph.table_id = c.id
      LEFT JOIN type_phones pt ON ph.type_phone_id = pt.id
      WHERE o.createdAt BETWEEN ${start} AND ${end}
      GROUP BY o.id;
    `;
  
    // Query 2: Breakdown dos produtos vendidos no período (global)
    const productsResult = await this.prisma.$queryRaw<Array<{
      product_id: string;
      product_name: string;
      totalQuantity: number;
      totalRevenue: number;
    }>>`
      SELECT 
        op.product_id,
        p.name AS product_name,
        SUM(op.quantity) AS totalQuantity,
        SUM(p.price * op.quantity) AS totalRevenue
      FROM order_products op
      JOIN orders o ON op.order_id = o.id
      JOIN products p ON op.product_id = p.id
      WHERE o.createdAt BETWEEN ${start} AND ${end}
      GROUP BY op.product_id;
    `;
  
    // Query 3: Detalhes dos produtos por pedido
    const orderIds = ordersResult.map(order => order.order_id);
    let orderProducts: Array<{
      order_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }> = [];
    if (orderIds.length > 0) {
      orderProducts = await this.prisma.$queryRaw`
        SELECT 
          op.order_id,
          op.product_id,
          p.name AS product_name,
          op.quantity,
          p.price
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        WHERE op.order_id IN (${Prisma.join(orderIds)})
      `;
    }
  
    // Agrupa os produtos por order_id
    const orderProductsMap = orderProducts.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push({
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
      });
      return acc;
    }, {} as Record<string, Array<{ productName: string; quantity: number; price: number }>>);
  
    // Agregação dos dados dos pedidos por vendedor
    let overallRevenue = 0;
    const sellerRevenue = new Map<string, { 
      sellerName: string;
      totalOrders: number;
      totalRevenue: number;
      maxOrder: number;
      minOrder: number;
      orders: Array<{
        orderCode: number;
        clientName: string;
        clientPhone: string;
        orderAmount: number;
        deliveryDate: Date | null;
        status: string;
        products: Array<{ productName: string; quantity: number; price: number }>;
      }>;
    }>();
  
    for (const row of ordersResult) {
      const sellerId = row.seller_id;
      const sellerName = row.seller_name;
      const orderAmount = row.order_amount;
  
      overallRevenue += orderAmount;
  
      if (!sellerRevenue.has(sellerId)) {
        sellerRevenue.set(sellerId, {
          sellerName,
          totalOrders: 0,
          totalRevenue: 0,
          maxOrder: orderAmount,
          minOrder: orderAmount,
          orders: [],
        });
      }
  
      const sellerData = sellerRevenue.get(sellerId)!;
      sellerData.totalOrders += 1;
      sellerData.totalRevenue += orderAmount;
      sellerData.maxOrder = Math.max(sellerData.maxOrder, orderAmount);
      sellerData.minOrder = Math.min(sellerData.minOrder, orderAmount);
  
      sellerData.orders.push({
        orderCode: row.order_code,
        clientName: row.client_name,
        clientPhone: row.client_phones || 'Não informado',
        orderAmount,
        deliveryDate: row.deliveryDate,
        status: row.status,
        products: orderProductsMap[row.order_id] || []  // Inclui os produtos deste pedido
      });
    }
  
    return {
      totalRevenue: overallRevenue,
      breakdown: productsResult,
      sellerRevenue: Array.from(sellerRevenue.values()),
    };
  }
  
  
  
  
  
}
