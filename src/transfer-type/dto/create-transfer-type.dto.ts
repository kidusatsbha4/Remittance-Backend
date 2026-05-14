import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransferTypeEnum } from '../entities/transfer-type.entity';

export class CreateTransferTypeDto {
  @IsEnum(TransferTypeEnum)
  transfer_type: TransferTypeEnum;

  @IsOptional()
  @IsString()
  description?: string;
}