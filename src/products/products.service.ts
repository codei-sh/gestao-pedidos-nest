import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany();
  }

  async addToStock(data: any) {
    const { productId, quantity } = data;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    const productUpdated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: product.stock + quantity,
      },
    });
    return productUpdated;
  }
}
