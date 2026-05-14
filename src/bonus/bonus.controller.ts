import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BonusService } from './bonus.service';
import { CreateBonusDto } from './dto/create-bonus.dto';
import { UpdateBonusDto } from './dto/update-bonus.dto';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  // CREATE BONUS
  @Post()
  create(@Body() createBonusDto: CreateBonusDto) {
    return this.bonusService.create(createBonusDto);
  }

  // GET ALL BONUS
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('page_size') pageSize: number = 10,
    @Query('search') search?: string,
    @Query('sort_by') sortBy: string = 'id',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('status') status?: string,
  ) {
    return this.bonusService.findAll({
      page: Number(page),
      pageSize: Number(pageSize),
      search,
      sortBy,
      order,
      status:
        status !== undefined
          ? status === 'true'
          : undefined,
    });
  }

  // GET BONUS DETAIL
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bonusService.findOne(id);
  }

  // UPDATE BONUS
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBonusDto: UpdateBonusDto,
  ) {
    return this.bonusService.update(id, updateBonusDto);
  }

  // DELETE BONUS
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bonusService.remove(id);
  }

  // ACTIVATE BONUS
  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.bonusService.activate(id);
  }

  // DEACTIVATE BONUS
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.bonusService.deactivate(id);
  }
}