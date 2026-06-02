import { Controller,Get, Post, Res,Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Response } from 'express';
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('generate-capture-context')
  @HttpCode(HttpStatus.OK)
  async generateCaptureContext() {
    return this.paymentsService.generateCaptureContext();
  }

   // ==============================
  // ✅ UPDATED: Serve Microform HTML page
  // ==============================
  @Post('microform')
  async getMicroformPage(@Res() res: Response) {
    const captureContext =
      await this.paymentsService.generateCaptureContext();

    const html =
      await this.paymentsService.buildMicroformHtml(
        captureContext as string,
      );

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  // ==============================
  // ✅ NEW: Receive transient token from HTML
  // ==============================
  @Post('process-token')
  async processToken(@Body() body: any) {
    const { transientToken, amount, currency } = body;

    return this.paymentsService.processPayment(
      {
        transientToken,
        amount,
        currency,
        ...body,
      },
      body.user || null,
    );
  }

   @Post('check-enrollment')
  @HttpCode(HttpStatus.OK)
  async checkEnrollment(@Body() body: any) {
    return this.paymentsService.checkEnrollment(body);
  }
@Post('authentication-results')
@HttpCode(HttpStatus.OK)
async authenticationResults(@Body() body: any) {
  return this.paymentsService.authenticationResults(body);
}
  @Post('process-payment')
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() body: any, @Request() req) {
    return this.paymentsService.processPayment(body, req.user);
  }

  @Post('pay')
@HttpCode(HttpStatus.OK)
async pay(@Body() body: any, @Request() req) {
  return this.paymentsService.pay(body, req.user);
}
}