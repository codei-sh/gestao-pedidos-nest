import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class SectorService {
  constructor(private prisma: PrismaService) {}

  async getAllSectors() {
    return this.prisma.sector.findMany();
  }
}
