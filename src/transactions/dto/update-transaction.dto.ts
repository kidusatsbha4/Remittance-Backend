// update-transaction.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  external_ref?: string;

  @IsOptional()
  @IsString()
  failure_reason?: string;

  @IsOptional()
  @IsNumber()
  exchange_rate?: number;
}