import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('prepare')
  async prepare(
    @Body() body: {
      orderId: number;
      amount: number;
    },
  ) {
    return this.paymentService.prepare(
      Number(body.orderId),
      Number(body.amount),
    );
  }
}
