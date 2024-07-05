import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma/prisma.service';

@Module({
  providers: [UserService, PrismaService],
  controllers: [UsersController],
})
export class UserModule {}
