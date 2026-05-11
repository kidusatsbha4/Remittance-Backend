// create-transaction.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  beneficiary_acc: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  channel?: string;
}