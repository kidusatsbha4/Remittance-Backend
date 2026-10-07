import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEmail,
} from 'class-validator';

export class CreateCashPickupDto {
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  external_reference_id: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  relationship_to_sender: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  expected_amount: number;

  @IsNumber()
  @IsNotEmpty()
  exchange_rate: number;
}
