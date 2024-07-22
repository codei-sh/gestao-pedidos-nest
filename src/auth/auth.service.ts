import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: any): Promise<any> {
    const { email, password } = data;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user || password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      roles: user.roles.map((role) => role.nome),
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user_id: user.id,
      roles: user.roles.map((role) => role.nome),
      access_token: accessToken,
    };
  }
}
