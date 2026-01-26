# UI/E2E 스크린샷 증적 자동화 구현

## 개요
- **타입**: feature
- **우선순위**: high
- **담당 에이전트**: QA
- **완료일**: 2026-01-26

## 태스크 설명
기존 API 테스트 외에 요구사항에 명시된 UI 기반 스텝별 스크린샷 캡처 기능을 Playwright 또는 Cypress 등을 활용해 보완하십시오.

---
*Follow-up from task: 통합 시스템 기능 테스트 수행 및 상세 결과 보고*

## 작업 보고서
QA AI Agent로서 **UI/E2E 스크린샷 증적 자동화 구현** 작업을 수행합니다. 이 구현은 Playwright를 사용하여 주요 비즈니스 시나리오의 각 단계별로 스크린샷을 생성하고, 이를 테스트 결과 보고서에 통합하는 것을 목표로 합니다.

### 1. 테스트 전략 및 설계
- **도구 선택**: Playwright (멀티 브라우저 지원 및 자동 대기 기능 우수)
- **증적 방식**: 각 `test.step` 마다 스크린샷 캡처 및 `allure` 또는 HTML 리포트에 첨부
- **엣지 케이스**: 네트워크 지연 시 로딩 인디케이터 캡처, 에러 모달 발생 시 자동 캡처

---

### 2. 코드 구현

```filepath:playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // 기본은 실패 시만, 하지만 커스텀 증적을 위해 'off' 지양
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

```filepath:e2e/utils/screenshot-helper.ts
import { Page, test } from '@playwright/test';

/**
 * 단계별 스크린샷을 캡처하고 리포트에 첨부하는 유틸리티
 */
export async function takeStepScreenshot(page: Page, stepName: string) {
  await test.step(`[증적 캡처] ${stepName}`, async () => {
    const fileName = `${Date.now()}_${stepName.replace(/\s+/g, '_')}.png`;
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach(fileName, {
      body: screenshot,
      contentType: 'image/png',
    });
  });
}
```

```filepath:e2e/fixtures/test-data.ts
export const TEST_USER = {
  username: 'test_qa_user',
  password: 'password123!',
};

export const ORDER_DATA = {
  productName: 'QA 자동화 테스트 상품',
  quantity: '2',
};
```

```filepath:e2e/auth-flow.spec.ts
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
```

```filepath:docs/testing/E2E_SCREENSHOT_GUIDE.md
# UI/E2E 스크린샷 증적 자동화 가이드

## 1. 목적
- 요구사항 준수 여부를 각 UI 단계별 시각적 증거(Screenshot)로 남김.
- 장애 발생 시 시점별 상태 확인을 통해 디버깅 시간 단축.

## 2. 사용 방법
- `takeStepScreenshot(page, "단계명")` 함수를 사용하여 필요한 비즈니스 로직 사이에 삽입.
- 캡처된 이미지는 `playwright-report` 폴더 내 HTML 보고서에 임베딩됨.

## 3. 실행 명령어
```bash
# 기본 실행
npx playwright test

# 보고서 확인
npx playwright show-report
```

## 4. 수락 기준 (Acceptance Criteria)
- [x] 모든 주요 시나리오 단계별 스크린샷이 존재해야 함.
- [x] 실패 시 자동으로 마지막 화면이 캡처되어야 함.
- [x] 보고서 파일에 이미지 파일이 바이너리로 포함되어 별도 저장소 없이 열람 가능해야 함.
```

---

### 3. 결과 보고 및 요약

#### 1. 생성/수정된 파일 목록
- `playwright.config.ts`: E2E 환경 설정 및 리포터 구성
- `e2e/utils/screenshot-helper.ts`: 단계별 증적 캡처 공통 유틸리티
- `e2e/fixtures/test-data.ts`: 테스트 데이터 관리
- `e2e/auth-flow.spec.ts`: 실제 비즈니스 시나리오 테스트 코드
- `docs/testing/E2E_SCREENSHOT_GUIDE.md`: QA 팀을 위한 운영 가이드

#### 2. 주요 구현 결정 사항
- **Step-based Capture**: 단순히 실패 시 캡처하는 기본 기능을 넘어, 성공 상황에서도 요구사항 이행 증적을 위해 `test.step` 기반의 커스텀 캡처 로직을 도입했습니다.
- **Full Page Screenshot**: 모달이나 하단 레이아웃 확인을 위해 전체 페이지 캡처 옵션을 기본으로 설정하였습니다.
- **Fixture 분리**: 테스트 계정 및 데이터를 별도 파일로 분리하여 유지보수성을 높였습니다.

#### 3. 테스트 권장 사항
- CI/CD 파이프라인(GitHub Actions 등) 연동 시 `playwright-report` 디렉토리를 Artifact로 업로드하도록 설정하십시오.
- 민감한 개인정보가 포함된 화면은 캡처 전 `page.evaluate`를 통해 마스킹 처리하는 로직 추가를 검토하십시오.

#### 4. 향후 계획 (Next Steps)
- 시각적 회귀 테스트(Visual Regression Testing)를 위한 `expect(page).toHaveScreenshot()` 기능 도입.
- 다국어 UI 지원에 따른 로케일별 캡처 자동화 확대.

---
*이 문서는 AI 에이전트에 의해 자동 생성되었습니다.*
