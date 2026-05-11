import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateManualDto {
  @IsString()
  @IsNotEmpty()
  toAccount: string;

  @IsString()
  @IsNotEmpty()
  toAccountHolder: string;

  @IsString()
  currency: string;

  @IsString()
  bonus: string;

  @IsString()
  toCurrency: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  eCurrency?: string;

  @IsOptional()
  @IsNumber()
  exchange_rate?: number;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  external_ref?: string;

  @IsNumber()
  sender_id: number;
}