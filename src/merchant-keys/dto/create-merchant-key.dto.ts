import { IsString } from 'class-validator';

export class CreateMerchantKeyDto {
  @IsString()
  merchant_id: string;

  @IsString()
  merchant_name: string;

  @IsString()
  secret_key: string;

  @IsString()
  access_key: string;
}