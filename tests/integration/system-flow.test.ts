import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SystemController } from '../../src/controllers/system.controller';
import testData from '../fixtures/test-data.json';
import * as fs from 'fs';

/**
 * @description 통합 시스템 기능 테스트 및 증적 수집
 * 정의된 테스트 사양서에 따른 Critical 경로 검증
 */
describe('Integrated System Functional Verification', () => {
  let systemController: SystemController;
  const logFilePath = './tests/logs/test-execution.log';

  beforeAll(() => {
    systemController = new SystemController();
    if (!fs.existsSync('./tests/logs')) fs.mkdirSync('./tests/logs');
    fs.appendFileSync(logFilePath, `--- Test Started at ${new Date().toISOString()} ---\n`);
  });

  const logResult = (testName: string, status: 'PASS' | 'FAIL', data?: any) => {
    const logEntry = `[${status}] ${testName} - ${JSON.stringify(data || {})}\n`;
    fs.appendFileSync(logFilePath, logEntry);
  };

  it('TC-01: 시스템 인증 및 초기화 기능을 검증한다', async () => {
    try {
      const response = await systemController.initialize(testData.validUser);
      expect(response.status).toBe(200);
      expect(response.data.initialized).toBe(true);
      logResult('TC-01: System Initialization', 'PASS', { userId: testData.validUser.id });
    } catch (error) {
      logResult('TC-01: System Initialization', 'FAIL', error);
      throw error;
    }
  });

  it('TC-02: Critical 우선순위 작업 처리 로직을 검증한다', async () => {
    try {
      const payload = testData.mockPayloads[0];
      const result = await systemController.processRequest(payload);
      
      expect(result.priority).toBe('critical');
      expect(result.status).toBe('completed');
      logResult('TC-02: Critical Task Processing', 'PASS', result);
    } catch (error) {
      logResult('TC-02: Critical Task Processing', 'FAIL', error);
      throw error;
    }
  });

  it('TC-03: [Edge Case] 유효하지 않은 토큰에 대한 에러 핸들링을 검증한다', async () => {
    try {
      await systemController.validateAuth(testData.edgeCases.invalidToken);
    } catch (error: any) {
      expect(error.code).toBe(401);
      logResult('TC-03: Invalid Token Handling', 'PASS', { errorCode: error.code });
      return;
    }
    throw new Error('Edge case validation failed: System did not throw 401');
  });

  afterAll(() => {
    fs.appendFileSync(logFilePath, `--- Test Ended at ${new Date().toISOString()} ---\n\n`);
  });
});