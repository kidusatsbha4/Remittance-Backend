import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { AuthGuard } from '../auth/auth.guard'; // Adjust path as needed


@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}
   
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateRolePermissionDto) {
    return this.service.create(dto);
  }
  @UseGuards(AuthGuard)
@Patch('manage')
managePermissions(@Body() dto: UpdateRolePermissionDto) {
  return this.service.managePermissions(dto);
}

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.service.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionDto,
  ) {
    return this.service.update(+id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @UseGuards(AuthGuard)
@Get('role/:roleId/permissions')
async getPermissionsByRole(@Param('roleId') roleId: string) {
  return this.service.getPermissionsByRole(+roleId);
}

@UseGuards(AuthGuard)
@Get('permission/:permissionId/roles')
async getRolesByPermission(@Param('permissionId') permissionId: string) {
  return this.service.getRolesByPermission(+permissionId);
}


}