import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Profil perusahaan tidak ditemukan');
    return company;
  }

  update(id: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id }, data: dto });
  }
}