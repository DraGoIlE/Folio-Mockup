import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const secret = req.headers['x-internal-secret'];
    const expected = process.env.INTERNAL_API_SECRET || 'dev-internal-secret-ganti-nanti';

    if (secret !== expected) {
      throw new UnauthorizedException('Internal secret tidak valid');
    }
    return true;
  }
}