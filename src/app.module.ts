import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma/prisma.service';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { SectorService } from './sector/sector.service';
import { SectorController } from './sector/sector.controller';
import { ClientsService } from './clients/clients.service';
import { ClientsController } from './clients/clients.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
  ],
  controllers: [
    AppController,
    ProductsController,
    SectorController,
    ClientsController,
  ],
  providers: [
    AppService,
    PrismaService,
    ProductsService,
    SectorService,
    ClientsService,
  ],
})
export class AppModule {}
