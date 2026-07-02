import { IsIn, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  profileId: string;

  @IsString()
  accountId: string;

  @IsIn(['candidate', 'company'])
  role: 'candidate' | 'company';
}