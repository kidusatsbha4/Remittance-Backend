import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashPickupService } from './cash-pickup.service';
import { CashPickupController } from './cash-pickup.controller';
import { CashPickup } from './entities/cash-pickup.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([CashPickup]), AuthModule],
  controllers: [CashPickupController],
  providers: [CashPickupService, AuthGuard],
  exports: [CashPickupService],
})
export class CashPickupModule {}
