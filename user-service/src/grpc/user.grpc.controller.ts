import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class UserGrpcController {
  constructor(private prisma: PrismaService) {}

  @GrpcMethod('UserService', 'GetCandidateProfile')
  async getCandidateProfile({ id }: { id: string }) {
    const c = await this.prisma.candidate.findUnique({ where: { id } });
    if (!c) throw new RpcException({ code: status.NOT_FOUND, message: 'Candidate not found' });

    return {
      id: c.id,
      name: c.fullName ?? '',
      skills: c.skills,
      experience_years: c.experienceYears,
      expected_salary: c.expectedSalary ?? 0,
      cv_url: c.cvUrl ?? '',
    };
  }

  @GrpcMethod('UserService', 'GetJobProfile')
  async getJobProfile({ id }: { id: string }) {
    const j = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!j) throw new RpcException({ code: status.NOT_FOUND, message: 'Job not found' });

    return {
      id: j.id,
      hrd_id: j.companyId,
      company_name: j.company.companyName ?? '',
      title: j.title,
      description: j.description ?? '',
      required_skills: j.requiredSkills,
      salary_min: j.salaryMin ?? 0,
      salary_max: j.salaryMax ?? 0,
    };
  }

  @GrpcMethod('UserService', 'ListCandidates')
  async listCandidates(data: { preferred_skills: string[]; limit: number }) {
    const candidates = await this.prisma.candidate.findMany({
      take: data.limit > 0 ? data.limit : undefined,
    });

    return {
      candidates: candidates.map((c) => ({
        id: c.id,
        name: c.fullName ?? '',
        skills: c.skills,
        experience_years: c.experienceYears,
        expected_salary: c.expectedSalary ?? 0,
        cv_url: c.cvUrl ?? '',
      })),
    };
  }

  @GrpcMethod('UserService', 'ListJobs')
  async listJobs(data: { candidate_skills: string[]; limit: number }) {
    const jobs = await this.prisma.jobPosting.findMany({
      take: data.limit > 0 ? data.limit : undefined,
      include: { company: true },
    });

    return {
      jobs: jobs.map((j) => ({
        id: j.id,
        hrd_id: j.companyId,
        company_name: j.company.companyName ?? '',
        title: j.title,
        description: j.description ?? '',
        required_skills: j.requiredSkills,
        salary_min: j.salaryMin ?? 0,
        salary_max: j.salaryMax ?? 0,
      })),
    };
  }
}