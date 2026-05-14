import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bonus } from './entities/bonus.entity';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bonus])],
  controllers: [BonusController],
  providers: [BonusService],
})
export class BonusModule {}