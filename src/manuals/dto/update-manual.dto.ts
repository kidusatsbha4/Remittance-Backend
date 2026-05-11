import { PartialType } from '@nestjs/mapped-types';
import { CreateManualDto } from './create-manual.dto';

export class UpdateManualDto extends PartialType(CreateManualDto) {}