import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manual } from './entities/manual.entity';
import { ManualService } from './manual.service';
import { ManualController } from './manual.controller';
import { AuthModule } from '../auth/auth.module';
import { InternalTransferModule } from '../internal-transfer/internal-transfer.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Manual]), AuthModule,InternalTransferModule,TransactionsModule],
  controllers: [ManualController],
  providers: [ManualService],
  exports:[ManualService]
})
export class ManualModule {}