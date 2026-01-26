import { test, expect } from '@playwright/test';
import { takeStepScreenshot } from './utils/screenshot-helper';
import { TEST_USER, ORDER_DATA } from './fixtures/test-data';

test.describe('E2E 비즈니스 프로세스 증적 자동화', () => {

  test('사용자 주문 및 결제 프로세스 검증 (스크린샷 포함)', async ({ page }) => {
    // 1. 로그인 단계
    await test.step('1. 로그인 페이지 접속 및 인증', async () => {
      await page.goto('/login');
      await page.fill('input[name="username"]', TEST_USER.username);
      await page.fill('input[name="password"]', TEST_USER.password);
      await takeStepScreenshot(page, '로그인 정보 입력');
      
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');
      await takeStepScreenshot(page, '로그인 완료 대시보드');
    });

    // 2. 상품 검색 및 선택
    await test.step('2. 상품 검색 및 상세 진입', async () => {
      await page.fill('input[placeholder="Search"]', ORDER_DATA.productName);
      await page.press('input[placeholder="Search"]', 'Enter');
      await takeStepScreenshot(page, '상품 검색 결과');
      
      await page.click(`text=${ORDER_DATA.productName}`);
      await expect(page).toContainURL('/product/');
      await takeStepScreenshot(page, '상품 상세 페이지');
    });

    // 3. 주문 시뮬레이션
    await test.step('3. 주문하기 및 결과 확인', async () => {
      await page.fill('input[type="number"]', ORDER_DATA.quantity);
      await takeStepScreenshot(page, '수량 수정');
      
      await page.click('button#buy-now');
      
      // 결제 성공 팝업/페이지 대기
      const successMessage = page.locator('.order-success-msg');
      await expect(successMessage).toBeVisible();
      await takeStepScreenshot(page, '최종 결제 완료 증적');
    });
  });

  test('비정상 케이스: 잘못된 로그인 정보 입력 시 오류 화면 캡처', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인 및 증적
    const errorAlert = page.locator('.alert-danger');
    await expect(errorAlert).toBeVisible();
    await takeStepScreenshot(page, '로그인 실패 에러 메시지');
  });
});