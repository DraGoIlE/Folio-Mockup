import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './candidates/candidates.module';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';
import { GrpcModule } from './grpc/grpc.module';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CandidatesModule,
    CompaniesModule,
    JobsModule,
    GrpcModule,
    InternalModule,
  ],
})
export class AppModule {}