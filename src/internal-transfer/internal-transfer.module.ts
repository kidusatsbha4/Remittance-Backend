import { Module } from '@nestjs/common';
import { InternalTransferController } from './internal-transfer.controller';
import { InternalTransferService } from './internal-transfer.service';
import { AuthModule } from '../auth/auth.module';


@Module({
     imports: [AuthModule],
  controllers: [InternalTransferController],
  providers: [InternalTransferService],
  exports:[InternalTransferService]
})
export class InternalTransferModule {}