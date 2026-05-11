import { IsString, IsNumber } from 'class-validator';

export class IpsPushPaymentDto {
  @IsString()
  debitAcc: string;

  @IsString()
  creditAcc: string;

  @IsString()
  destBank: string;

  @IsNumber()
  amount: number;

  @IsString()
  remark: string;

  @IsString()
  source: string;

  @IsString()
  orgnlId: string;

  @IsString()
  userId: string;

}