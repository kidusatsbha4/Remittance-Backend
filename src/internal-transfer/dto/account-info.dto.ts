import { IsString } from 'class-validator';

export class AccountInfoDto {
  @IsString()
  account_number: string;
}