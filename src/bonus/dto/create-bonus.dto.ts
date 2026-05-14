import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateBonusDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}