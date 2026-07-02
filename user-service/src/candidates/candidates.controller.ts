import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CandidatesService } from './candidates.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('candidate')
@Controller('candidates')
export class CandidatesController {
  constructor(private service: CandidatesService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.service.findById(req.user.profileId);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateCandidateDto) {
    return this.service.update(req.user.profileId, dto);
  }
}