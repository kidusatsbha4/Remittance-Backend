import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,UseInterceptors, ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AuthGuard } from '../auth/auth.guard'; // Adjust path as needed

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user-roles')

export class UserRolesController {
  constructor(private readonly service: UserRolesService) {}
  
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateUserRoleDto) {
    return this.service.create(dto);
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
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.service.update(+id, dto);
  }
  
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @UseGuards(AuthGuard)
@Get('user/:userId/roles')
getRolesByUser(@Param('userId') userId: string) {
  return this.service.getRolesByUser(+userId);
}

@UseGuards(AuthGuard)
@Get('role/:roleId/users')
getUsersByRole(@Param('roleId') roleId: string) {
  return this.service.getUsersByRole(+roleId);
}

}