import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  create(companyId: string, dto: CreateJobDto) {
    return this.prisma.jobPosting.create({
      data: { ...dto, companyId },
    });
  }

  findAllByCompany(companyId: string) {
    return this.prisma.jobPosting.findMany({ where: { companyId } });
  }
}