import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantKeyDto } from './create-merchant-key.dto';

export class UpdateMerchantKeyDto extends PartialType(CreateMerchantKeyDto) {}