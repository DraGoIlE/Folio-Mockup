import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from './internal-auth.guard';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

@UseGuards(InternalAuthGuard)
@Controller('internal/token-status')
export class InternalController {
  constructor(private tokenBlacklist: TokenBlacklistService) {}

  @Post()
  check(@Body('token') token: string) {
    return { blacklisted: this.tokenBlacklist.isBlacklisted(token) };
  }
}
