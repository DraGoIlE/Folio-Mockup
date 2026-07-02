import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from './internal-auth.guard';
import { InternalService } from './internal.service';
import { CreateProfileDto } from './dto/create-profile.dto';

@UseGuards(InternalAuthGuard)
@Controller('internal/profiles')
export class InternalController {
  constructor(private service: InternalService) {}

  @Post()
  create(@Body() dto: CreateProfileDto) {
    return this.service.createProfile(dto);
  }
}