import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class InternalService {
  constructor(private prisma: PrismaService) {}

  createProfile(dto: CreateProfileDto) {
    if (dto.role === 'candidate') {
      return this.prisma.candidate.create({
        data: { id: dto.profileId, accountId: dto.accountId },
      });
    }
    return this.prisma.company.create({
      data: { id: dto.profileId, accountId: dto.accountId },
    });
  }
}