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

  @Post('confirm')
  async confirmPayment(@Body() body: { paymentKey: string; orderId: string; amount: number }) {
    return this.paymentService.confirmPayment(body);
  }

  @Post('webhook')
  async handleTossWebhook(@Body() body: any) {
    // 실제 환경에서는 토스 서버의 요청인지 검증(Signature 등)하는 로직이 필요합니다.
    console.log('Toss Webhook Received:', body);
    
    // TODO: body.orderId와 body.status를 바탕으로 DB 상태(orders, payments) 업데이트
    
    // 토스 서버에게 정상적으로 수신했음을 알림 (200 OK)
    return { received: true, status: 'ok' };
  }
}
