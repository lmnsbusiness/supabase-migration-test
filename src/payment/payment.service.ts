import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new BadRequestException('Payment amount does not match order amount');
    }

    const paymentResult = await this.databaseService.query(
      `
      INSERT INTO payments (
        order_id,
        amount,
        status
      )
      VALUES ($1, $2, 'ready')
      RETURNING
        id,
        order_id,
        payment_key,
        amount,
        status,
        created_at
      `,
      [orderId, amount],
    );

    return paymentResult.rows[0];
  }
}
