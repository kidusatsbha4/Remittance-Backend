import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { InternalTransferModule } from '../internal-transfer/internal-transfer.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ManualModule } from '../manuals/manual.module';
import { TransferType } from '../transfer-type/entities/transfer-type.entity';
import { TransferTypeModule } from '../transfer-type/transfer-type.module';






@Module({
  imports: [AuthModule,ConfigModule, InternalTransferModule, // ✅ FIXED
    TransactionsModule,ManualModule,TransferType,TransferTypeModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}