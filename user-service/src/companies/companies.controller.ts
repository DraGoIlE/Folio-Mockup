import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('company')
@Controller('companies')
export class CompaniesController {
  constructor(private service: CompaniesService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.service.findById(req.user.profileId);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    return this.service.update(req.user.profileId, dto);
  }
}