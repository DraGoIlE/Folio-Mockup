import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Profil kandidat tidak ditemukan');
    return candidate;
  }

  update(id: string, dto: UpdateCandidateDto) {
    return this.prisma.candidate.update({ where: { id }, data: dto });
  }
}