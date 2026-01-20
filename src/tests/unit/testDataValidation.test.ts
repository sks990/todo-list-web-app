import fs from 'fs';
import path from 'path';
import { validateTestData } from '../utils/validator';

describe('Test Data Quality & Syntax Validation', () => {
  const dataPath = path.resolve(__dirname, '../fixtures/test-data.json');
  let testData: any;

  beforeAll(() => {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    testData = JSON.parse(rawData);
  });

  test('TC-01: test-data.json은 올바른 JSON 규격이어야 한다.', () => {
    expect(testData).toBeDefined();
    expect(typeof testData).toBe('object');
  });

  test('TC-02: 런타임 메서드(.padEnd 등)가 데이터에 포함되지 않아야 한다.', () => {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    expect(rawData).not.toContain('.padEnd(');
    expect(rawData).not.toContain('.padStart(');
  });

  test('TC-03: 필수 데이터 필드가 모두 존재해야 한다.', () => {
    expect(() => validateTestData(testData)).not.toThrow();
  });

  test('TC-04: (Edge Case) 데이터 필드 내에 특수문자나 예상치 못한 기호 검증', () => {
    testData.users.forEach((user: any) => {
      expect(user.id).toMatch(/^[a-zA-Z0-9]+$/);
      expect(user.email).toContain('@');
    });
  });
});