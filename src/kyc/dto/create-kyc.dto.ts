import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateKycDto {
  @IsNotEmpty()
  user_id: number;

  @IsString()
  id_type: string;

  @IsDateString()
  dob: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  country: string;
}