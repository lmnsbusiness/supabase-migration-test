import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database.service';

@Injectable()
export class PaymentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async prepare(orderId: number, amount: number) {
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new BadRequestException('orderId must be a positive integer');
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive integer');
    }

    const orderResult = await this.databaseService.query(
      `
      SELECT id, amount, status
      FROM orders
      WHERE id = $1
      `,
      [orderId],
    );

    if (orderResult.rowCount === 0) {
      throw new NotFoundException('Order not found');
    }

    const order = orderResult.rows[0];

    if (order.amount !== amount) {
      throw new BadRequestException(
        'Payment amount does not match order amount',
      );
    }

    const tossOrderId = `TOSS_${randomUUID()}`;

    const paymentResult = await this.databaseService.query(
      `
      INSERT INTO payments (
        order_id,
        toss_order_id,
        amount,
        status
      )
      VALUES ($1, $2, $3, 'ready')
      RETURNING
        id,
        order_id,
        toss_order_id,
        payment_key,
        amount,
        status,
        created_at
      `,
      [orderId, tossOrderId, amount],
    );

    return paymentResult.rows[0];
  }

  async confirmPayment(data: { paymentKey: string; orderId: string; amount: number }) {
    const { paymentKey, orderId, amount } = data;
    const secretKey = process.env.TOSS_SECRET_KEY;
    
    if (!secretKey) {
      return { error: 'TOSS_SECRET_KEY is missing' };
    }
    
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');
    
    try {
      const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      
      const tossResult = await response.json();
      
      // TODO: 실제 DB 연동에 맞춰 UPDATE 쿼리 추가 필요 (status = 'approved')
      
      return { tossResult };
    } catch (error) {
      return { error: error.message };
    }
  }
}
