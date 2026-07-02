import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private tokenBlacklist: TokenBlacklistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-ganti-nanti',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && this.tokenBlacklist.isBlacklisted(token)) {
      throw new UnauthorizedException('Token sudah logout, silakan login ulang');
    }

    return {
      profileId: payload.sub,
      accountId: payload.accountId,
      role: payload.role,
      email: payload.email,
    };
  }
}