import { Controller, Post, Body, HttpCode, HttpStatus,Request,UseGuards  } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';


@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('generate-capture-context')
  @HttpCode(HttpStatus.OK)
  async generateCaptureContext() {
    return this.paymentsService.generateCaptureContext();
  }

  // @Post('process-payment')
  // @HttpCode(HttpStatus.OK)
  // async processPayment(@Body() body: any) {
  //   return this.paymentsService.processPayment(body);
  // }

  // ✅ UPDATED

  // @UseGuards(AuthGuard)
@Post('process-payment')
async processPayment(@Body() body: any, @Request() req) {
  return this.paymentsService.processPayment(body, req.user);
}
}