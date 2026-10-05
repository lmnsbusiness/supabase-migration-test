import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryService {
  async registerShipment(data: { orderId: string; courier: string; trackingNumber: string }) {
    // 실무에서는 DB UPDATE orders/deliveries SET status = 'shipped', tracking_number = $1
    return {
      message: 'Shipment registered successfully',
      orderId: data.orderId,
      courier: data.courier,
      trackingNumber: data.trackingNumber,
      status: 'shipped',
      shippedAt: new Date().toISOString(),
    };
  }

  async handleWebhook(payload: any) {
    // 택배사 배송 상태(배송출발, 배송중, 배송완료 등) 웹훅 수신
    const trackingNumber = payload.trackingNumber || payload.invoice_no;
    const status = payload.status || 'delivered';

    return {
      received: true,
      trackingNumber,
      deliveryStatus: status,
      receivedAt: new Date().toISOString(),
    };
  }
}
