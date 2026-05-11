import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MerchantKeysService } from './merchant-keys.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateMerchantKeyDto } from './dto/create-merchant-key.dto';
import { UpdateMerchantKeyDto } from './dto/update-merchant-key.dto';

@Controller('merchant-keys')
@UseGuards(AuthGuard) // 🔐 protect all routes
export class MerchantKeysController {
  constructor(private readonly service: MerchantKeysService) {}

  // ✅ CREATE (store Cybersource keys from frontend)
  @Post()
  create(@Body() dto: CreateMerchantKeyDto) {
    return this.service.create(dto);
  }

  // ✅ GET ALL (pagination + search)
  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // ✅ GET ONE (DETAIL)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ✅ UPDATE (merchant info or keys if rotated)
  @Patch(':id')
update(
  @Param('id') id: string,
  @Body() dto: UpdateMerchantKeyDto,
) {
  return this.service.update(Number(id), dto);
}

  // ✅ DELETE (remove merchant keys)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  // 🔥 TOGGLE STATUS (enable/disable merchant integration)
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(+id);
  }
}