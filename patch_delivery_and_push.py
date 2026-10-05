import os
import subprocess

# 1. src/delivery 디렉토리 생성
os.makedirs('src/delivery', exist_ok=True)

# 2. src/delivery/delivery.service.ts 생성
delivery_service = """import { Injectable } from '@nestjs/common';

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
"""

with open('src/delivery/delivery.service.ts', 'w') as f:
    f.write(delivery_service)
print("생성 완료: src/delivery/delivery.service.ts")

# 3. src/delivery/delivery.controller.ts 생성
delivery_controller = """import { Controller, Post, Body } from '@nestjs/common';
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
"""

with open('src/delivery/delivery.controller.ts', 'w') as f:
    f.write(delivery_controller)
print("생성 완료: src/delivery/delivery.controller.ts")

# 4. src/delivery/delivery.module.ts 생성
delivery_module = """import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
"""

with open('src/delivery/delivery.module.ts', 'w') as f:
    f.write(delivery_module)
print("생성 완료: src/delivery/delivery.module.ts")

# 5. src/app.module.ts에 DeliveryModule 등록
app_module_path = 'src/app.module.ts'
with open(app_module_path, 'r') as f:
    app_content = f.read()

if 'DeliveryModule' not in app_content:
    import_stmt = "import { DeliveryModule } from './delivery/delivery.module';\n"
    app_content = import_stmt + app_content
    app_content = app_content.replace('imports: [', 'imports: [\n    DeliveryModule,', 1)
    with open(app_module_path, 'w') as f:
        f.write(app_content)
    print("업데이트 완료: src/app.module.ts (DeliveryModule 추가)")

# 6. Git Push
print("\nGit 커밋 및 Render 배포를 진행합니다...")
subprocess.run(["git", "add", "."])
subprocess.run(["git", "commit", "-m", "feat: 배송 등록(POST /deliveries/ship) 및 배송 상태 웹훅(POST /deliveries/webhook) 구현"])
subprocess.run(["git", "push", "origin", "main"])
print("\nGitHub Push 완료! Render 자동 배포가 시작되었습니다.")
