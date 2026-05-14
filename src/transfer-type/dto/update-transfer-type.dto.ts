import { PartialType } from '@nestjs/mapped-types';
import { CreateTransferTypeDto } from './create-transfer-type.dto';

export class UpdateTransferTypeDto extends PartialType(CreateTransferTypeDto) {}