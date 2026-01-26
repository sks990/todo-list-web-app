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