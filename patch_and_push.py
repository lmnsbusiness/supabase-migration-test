import os
import subprocess

# 파일 위치 자동 탐색 (단수/복수형 폴더명 대응)
def find_file(filename_options):
    for root, dirs, files in os.walk('src'):
        for f in files:
            if f in filename_options:
                return os.path.join(root, f)
    return None

controller_path = find_file(['payment.controller.ts', 'payments.controller.ts'])
service_path = find_file(['payment.service.ts', 'payments.service.ts'])

controller_code = """
  @Post('confirm')
  async confirmPayment(@Body() body: { paymentKey: string; orderId: string; amount: number }) {
    return this.paymentsService.confirmPayment(body);
  }
"""

service_code = """
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
"""

def append_code(filepath, code):
    if not filepath:
        print("파일을 찾을 수 없습니다.")
        return False
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    if "confirmPayment" in content:
        print(f"{filepath} 파일에 이미 confirm 코드가 존재합니다.")
        return True
        
    # 클래스의 마지막 닫는 괄호 '}' 바로 앞에 코드 삽입
    last_brace = content.rfind('}')
    if last_brace != -1:
        # 서비스 주입 변수명이 paymentService 인지 paymentsService 인지 자동 맞춤
        if 'paymentService' in content and not 'paymentsService' in content:
            code = code.replace('this.paymentsService', 'this.paymentService')
            
        new_content = content[:last_brace] + code + content[last_brace:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"업데이트 완료: {filepath}")
        return True
    return False

if append_code(controller_path, controller_code) and append_code(service_path, service_code):
    print("\n코드가 성공적으로 패치되었습니다. GitHub로 Push 합니다...\n")
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "feat: POST /payments/confirm API 추가"])
    subprocess.run(["git", "push", "origin", "main"])
else:
    print("코드 패치에 실패했습니다. 구조를 확인해주세요.")
