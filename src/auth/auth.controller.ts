// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() data: any) {
    const user = await this.authService.login(data);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
