import os
import subprocess

def find_file(filename_options):
    for root, dirs, files in os.walk('src'):
        for f in files:
            if f in filename_options:
                return os.path.join(root, f)
    return None

controller_path = find_file(['payment.controller.ts', 'payments.controller.ts'])

webhook_code = """
  @Post('webhook')
  async handleTossWebhook(@Body() body: any) {
    // 실제 환경에서는 토스 서버의 요청인지 검증(Signature 등)하는 로직이 필요합니다.
    console.log('Toss Webhook Received:', body);
    
    // TODO: body.orderId와 body.status를 바탕으로 DB 상태(orders, payments) 업데이트
    
    // 토스 서버에게 정상적으로 수신했음을 알림 (200 OK)
    return { received: true, status: 'ok' };
  }
"""

def append_code(filepath, code):
    if not filepath:
        print("컨트롤러 파일을 찾을 수 없습니다.")
        return False
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    if "handleTossWebhook" in content:
        print("이미 Webhook 엔드포인트가 존재합니다.")
        return True
        
    last_brace = content.rfind('}')
    if last_brace != -1:
        new_content = content[:last_brace] + code + content[last_brace:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

if append_code(controller_path, webhook_code):
    print("\nWebhook 코드가 추가되었습니다. GitHub로 Push 합니다...\n")
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "feat: POST /payments/webhook 수신부 구현"])
    subprocess.run(["git", "push", "origin", "main"])
else:
    print("코드 패치에 실패했습니다.")
