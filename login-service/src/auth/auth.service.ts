import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { ProfileClientService } from './profile-client.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private tokenBlacklist: TokenBlacklistService,
    private profileClient: ProfileClientService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.account.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const accountId = randomUUID();
    const profileId = randomUUID();

    // Bikin profil kosong dulu di user-service SEBELUM akun disimpan,
    // supaya kalau ini gagal, tidak ada akun "nyantol" tanpa profil.
    await this.profileClient.createProfile(profileId, accountId, dto.role);

    const account = await this.prisma.account.create({
      data: {
        id: accountId,
        email: dto.email,
        passwordHash,
        role: dto.role,
        profileId,
      },
    });

    return this.buildTokenResponse(account);
  }

  async login(dto: LoginDto) {
    const account = await this.prisma.account.findUnique({ where: { email: dto.email } });
    if (!account) throw new UnauthorizedException('Email atau password salah');

    const valid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!valid) throw new UnauthorizedException('Email atau password salah');

    return this.buildTokenResponse(account);
  }

  logout(token: string) {
    this.tokenBlacklist.add(token);
    return { message: 'Logout berhasil' };
  }

  private buildTokenResponse(account: any) {
    const payload = {
      sub: account.profileId,
      accountId: account.id,
      role: account.role,
      email: account.email,
    };

    return {
      access_token: this.jwt.sign(payload),
      profile_id: account.profileId,
      role: account.role,
    };
  }
}