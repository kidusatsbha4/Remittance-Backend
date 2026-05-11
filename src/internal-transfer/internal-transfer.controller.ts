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
  @UseGuards(AuthGuard) // optional (recommended)
  @Post('account-info')
  getAccountInfo(@Body() dto: AccountInfoDto) {
    return this.service.getAccountInfo(dto);
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