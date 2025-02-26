import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Token não fornecido.');
    }

    const token = authHeader.split(' ')[1]; // Remove "Bearer"

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { roles: string[] };

      if (!decoded.roles.includes('admin')) {
        throw new ForbiddenException('Acesso negado.');
      }

      // O usuário é admin, então o acesso é permitido
      return true;
    } catch (error) {
      throw new ForbiddenException('Token inválido ou expirado.');
    }
  }
}
