import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() description?: string;
}