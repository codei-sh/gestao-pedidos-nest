import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    const token = authHeader.split(' ')[1]; // Remove "Bearer"

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; roles: string[] };

      req.user = { // Agora o TypeScript reconhece req.user
        userId: decoded.userId,
        roles: decoded.roles,
      };

      if (!req.user.roles.includes('admin')) {
        throw new ForbiddenException('Acesso negado.');
      }

      next(); // Segue para o controller
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
