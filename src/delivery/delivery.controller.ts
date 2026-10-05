import { Controller, Post, Body } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('ship')
  async shipOrder(@Body() body: { orderId: string; courier: string; trackingNumber: string }) {
    return this.deliveryService.registerShipment(body);
  }

  @Post('webhook')
  async deliveryWebhook(@Body() payload: any) {
    return this.deliveryService.handleWebhook(payload);
  }
}
