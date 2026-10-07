import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CashPickupService } from './cash-pickup.service';
import { CreateCashPickupDto } from './dto/create-cash-pickup.dto';
import { UpdateCashPickupDto } from './dto/update-cash-pickup.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cash-pickup')
export class CashPickupController {
  constructor(private readonly service: CashPickupService) {}

  // ✅ CREATE CASH PICKUP
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateCashPickupDto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  // ✅ GET CASH PICKUPS BY SENDER (current user's cash pickups) - MUST be before :id route
  @UseGuards(AuthGuard)
  @Get('my-pickups')
  findMyCashPickups(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('page_size') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('sort_by') sortBy: string = 'created_at',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query() filters?: any,
  ) {
    return this.service.findBySender(req.user.sub, {
      page,
      pageSize,
      search,
      sortBy,
      order,
      ...filters,
    });
  }

  // ✅ GET SINGLE CASH PICKUP BY ID
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
// ✅ UPDATE CASH PICKUP (STATUS ONLY)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCashPickupDto,
  ) {
    return this.service.update(+id, dto);
  }
  // ✅ GET ALL CASH PICKUPS WITH PAGINATION & FILTERS
  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('page_size') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('sort_by') sortBy: string = 'created_at',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
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

  

  // ✅ DELETE CASH PICKUP BY ID
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
