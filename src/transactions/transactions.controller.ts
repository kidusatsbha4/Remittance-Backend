// transactions.controller.ts
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
  Req,UseInterceptors,ClassSerializerInterceptor
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';

@UseInterceptors(ClassSerializerInterceptor) // Enables the @Exclude() decorator
@Controller('transactions')
 @UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  // ✅ CREATE
  @Post()
  create(@Body() dto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  // ✅ GET ALL
  @Get()
  findAll(@Query() query) {
    return this.service.findAll(query);
  }

  // ✅ MY TRANSACTIONS
  @Get('me')
  myTransactions(@Req() req) {
    return this.service.myTransactions(req.user);
  }

  // ✅ GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ✅ UPDATE
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto) {
    return this.service.update(+id, dto);
  }

  // ❌ DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  // ✅ SUCCESS
  @Patch(':id/success')
  success(
    @Param('id') id: string,
    @Body('external_ref') external_ref: string,
  ) {
    return this.service.markSuccess(+id, external_ref);
  }

  // ❌ FAILED
  @Patch(':id/failed')
  failed(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.service.markFailed(+id, reason);
  }
}