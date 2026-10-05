import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() body: { userId?: number | null; amount: number },
  ) {
    return this.orderService.create(
      body.userId ?? null,
      Number(body.amount),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(Number(id));
  }

  @Post(':id/approve')
  async approveOrder(@Param('id') id: string) {
    const service = (this as any).ordersService || (this as any).orderService;
    return service.approveOrder(id);
  }

  @Post(':id/reject')
  async rejectOrder(@Param('id') id: string) {
    const service = (this as any).ordersService || (this as any).orderService;
    return service.rejectOrder(id);
  }
}
