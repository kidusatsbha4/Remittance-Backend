import { PartialType } from '@nestjs/mapped-types';
import { CreateCashPickupDto } from './create-cash-pickup.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateCashPickupDto extends PartialType(CreateCashPickupDto) {
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'VERIFIED', 'PAID', 'CANCELLED', 'EXPIRED'])
  receiver_status?: string;
}
