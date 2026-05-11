import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,Req
} from '@nestjs/common';
import { ManualService } from './manual.service';
import { CreateManualDto } from './dto/create-manual.dto';
import { UpdateManualDto } from './dto/update-manual.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('manuals')
export class ManualController {
  constructor(private readonly service: ManualService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('page_size') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('sort_by') sortBy: string = 'id',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query() filters?: any,
  ) {
    return this.service.findAll({
      page,
      pageSize,
      search,
      sortBy,
      order,
      ...filters,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateManualDto) {
    return this.service.update(+id, dto);
  }

  // ✅ SPECIAL: mark as paid
  @UseGuards(AuthGuard)
  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.service.markAsPaid(+id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}