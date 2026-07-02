import { IsArray, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class UpdateCandidateDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsArray() skills?: string[];
  @IsOptional() @IsUrl() cvUrl?: string;
  @IsOptional() @IsInt() @Min(0) expectedSalary?: number;
  @IsOptional() @IsInt() @Min(0) experienceYears?: number;
}