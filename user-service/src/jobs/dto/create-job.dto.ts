import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateJobDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() requirements?: string;
  @IsArray() requiredSkills: string[];
  @IsOptional() @IsInt() @Min(0) salaryMin?: number;
  @IsOptional() @IsInt() @Min(0) salaryMax?: number;
}