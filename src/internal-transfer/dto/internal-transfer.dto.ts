import { IsString } from 'class-validator';

export class InternalTransferDto {
  @IsString()
  fromAccount: string;

  @IsString()
  fromAccountHolder: string;

  @IsString()
  toAccount: string;

  @IsString()
  toAccountHolder: string;

  @IsString()
  currency: string;

  @IsString()
  toCurrency: string;

  @IsString()
  amount: string;

  @IsString()
  remark: string;
}