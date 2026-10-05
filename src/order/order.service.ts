import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Injectable()
export class OrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userId: number | null, amount: number) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive integer');
    }

    const result = await this.databaseService.query(
      `
      INSERT INTO orders (user_id, amount, status)
      VALUES ($1, $2, 'pending')
      RETURNING id, user_id, amount, status, created_at
      `,
      [userId, amount],
    );

    return result.rows[0];
  }

  async findOne(id: number) {
    const result = await this.databaseService.query(
      `
      SELECT id, user_id, amount, status, created_at
      FROM orders
      WHERE id = $1
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Order not found');
    }

    return result.rows[0];
  }

  async approveOrder(id: string) {
    return {
      message: 'Order approved successfully',
      orderId: id,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    };
  }

  async rejectOrder(id: string) {
    return {
      message: 'Order rejected successfully',
      orderId: id,
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    };
  }
}
