import { Controller, Get } from '@nestjs/common';
import { SectorService } from './sector.service';
import { Sector } from '@prisma/client';

@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Get('index')
  async getAllSectors(): Promise<Sector[]> {
    return this.sectorService.getAllSectors();
  }
}
