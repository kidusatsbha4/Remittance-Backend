import { Controller, Get, Post, Body, Patch, Param, Delete, Query,UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../auth/auth.guard'; // Adjust path as needed

@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateRoleDto) {
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
  @Query() filters?: any, // 🔥 important for dynamic filters
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
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(+id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}