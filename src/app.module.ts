import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        secret: 'fad7a359-5716-4387-b968-43dad376b3a8',
        signOptions: { expiresIn: '24h' },
      }),
    }),
    UserModule,
    PrismaModule,
  ],
  controllers: [
    AppController,
    ProductsController,
    SectorController,
    ClientsController,
    OrdersController,
    AuthController,
  ],
  providers: [
    AppService,
    PrismaService,
    ProductsService,
    SectorService,
    ClientsService,
    OrdersService,
    AuthService,
  ],
})
export class AppModule {}
