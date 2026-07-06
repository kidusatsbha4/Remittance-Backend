import {
  Controller,
  Post,
  Body,
  UseGuards,Get
} from '@nestjs/common';
import { InternalTransferService } from './internal-transfer.service';
import { AccountInfoDto } from './dto/account-info.dto';
import { InternalTransferDto } from './dto/internal-transfer.dto';
import { AuthGuard } from '../auth/auth.guard';

import { IpsAccountVerificationDto } from './dto/ips-account-verification.dto'; // 🔴 NEW
import { IpsPushPaymentDto } from './dto/ips-push-payment.dto'; // 🔴 NEW

@Controller('internal-transfer')
export class InternalTransferController {
  constructor(private readonly service: InternalTransferService) {}

  // 🔍 Get account name
  //  @UseGuards(AuthGuard) // optional (recommended)
  // @Post('account-info')
  // getAccountInfo(@Body() dto: AccountInfoDto) {
  //   return this.service.getAccountInfo(dto);
  // }
 @UseGuards(AuthGuard) // Temporarily commented for testing
  @Post('account-info')
  async getAccountInfo(@Body() dto: AccountInfoDto) {
    console.log('================ MOBILE ACCOUNT INFO REQUEST ================');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Endpoint: POST /internal-transfer/account-info');
    console.log('Request from mobile app for account:', dto.account_number);
    console.log('⚠️  AUTH GUARD TEMPORARILY DISABLED FOR TESTING');
    
    try {
      const result = await this.service.getAccountInfo(dto);
      
      // Ensure mobile-friendly response format
      if (result.success) {
        console.log('✅ Account info retrieved successfully for mobile');
        console.log('Account holder:', result.account?.accountHolderName);
        console.log('Account status:', result.account?.accountStatus);
        console.log('Available balance:', result.account?.balance?.available);
      } else {
        console.log('❌ Account info retrieval failed');
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Controller error:', error.message);
      
      // Return mobile-friendly error response
      return {
        success: false,
        error: 'Account information not available',
        message: error.message || 'Unable to retrieve account details',
        account: null
      };
    }
  }
  // 💸 Make transfer
  @UseGuards(AuthGuard) // optional
  @Post('send')
  transfer(@Body() dto: InternalTransferDto) {
    return this.service.transfer(dto);
  }
  // 🔴 NEW: IPS Account Verification
 
  @Post('ips/account-verification')
  verifyAccount(@Body() dto: IpsAccountVerificationDto) {
    return this.service.verifyAccount(dto);
  }

  // 🔴 NEW: IPS Push Payment
  
  @Post('ips/push-payment')
  pushPayment(@Body() dto: IpsPushPaymentDto) {
    return this.service.pushPayment(dto);
  }

  @Get('rate')
getRate() {
  return this.service.getRate();
}
 
}