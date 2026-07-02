import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly loginServiceUrl = process.env.LOGIN_SERVICE_URL || 'http://localhost:3000';
  private readonly internalSecret =
    process.env.INTERNAL_API_SECRET || 'dev-internal-secret-ganti-nanti';

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-ganti-nanti',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (token) {
      const blacklisted = await this.checkBlacklist(token);
      if (blacklisted) {
        throw new UnauthorizedException('Token sudah logout, silakan login ulang');
      }
    }

    return {
      profileId: payload.sub,
      accountId: payload.accountId,
      role: payload.role,
      email: payload.email,
    };
  }

  private async checkBlacklist(token: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.loginServiceUrl}/internal/token-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': this.internalSecret,
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!data.blacklisted;
    } catch {
      // Kalau login-service lagi down, jangan sampai semua endpoint user-service
      // ikut lumpuh. Fail-open sementara: anggap token tidak diblacklist.
      return false;
    }
  }
}