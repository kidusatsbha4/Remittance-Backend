import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantKey } from './entities/merchant-keys.entity';
import { MerchantKeysService } from './merchant-keys.service';
import { MerchantKeysController } from './merchant-keys.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantKey]),
    AuthModule, // ✅ for AuthGuard
  ],
  controllers: [MerchantKeysController],
  providers: [MerchantKeysService],
  exports: [MerchantKeysService], // 🔥 important for other modules (transactions, payments)
})
export class MerchantKeysModule {}