import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('company')
@Controller('jobs')
export class JobsController {
  constructor(private service: JobsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateJobDto) {
    return this.service.create(req.user.profileId, dto);
  }

  @Get('mine')
  findMine(@Req() req: any) {
    return this.service.findAllByCompany(req.user.profileId);
  }
}