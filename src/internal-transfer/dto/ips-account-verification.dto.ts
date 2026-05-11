import { IsString } from 'class-validator';

export class IpsAccountVerificationDto {
  @IsString()
  account: string; // 🔴 UPDATED (was probably wrong before)

  @IsString()
  destinBank: string; // 🔴 UPDATED
}