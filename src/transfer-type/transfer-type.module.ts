import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferType } from './entities/transfer-type.entity';
import { TransferTypeService } from './transfer-type.service';
import { TransferTypeController } from './transfer-type.controller';


@Module({
  imports: [TypeOrmModule.forFeature([TransferType])],
  controllers: [TransferTypeController],
  providers: [TransferTypeService],
    exports: [TypeOrmModule],

})
export class TransferTypeModule {}