import { Controller, Get, Post, Body, Patch, Param, Delete, Query,UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AuthGuard } from '../auth/auth.guard'; // Adjust path as needed


@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.service.create(dto);
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
  update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.service.update(+id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}