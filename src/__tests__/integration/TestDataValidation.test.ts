import testData from '../fixtures/test-data.json';
import { BUSINESS_RULES } from '../utils/validation-rules';

describe('테스트 데이터 비즈니스 정책 유효성 검증', () => {
  
  describe('정상 데이터(validUsers) 검증', () => {
    testData.validUsers.forEach((user) => {
      test(`사용자 ID ${user.id} (${user.username}) 데이터는 정책을 준수해야 함`, () => {
        // 1. Username 검증
        expect(user.username.length).toBeGreaterThanOrEqual(BUSINESS_RULES.USERNAME.MIN_LENGTH);
        expect(user.username.length).toBeLessThanOrEqual(BUSINESS_RULES.USERNAME.MAX_LENGTH);
        expect(user.username).toMatch(BUSINESS_RULES.USERNAME.PATTERN);

        // 2. Email 검증
        expect(user.email).toMatch(BUSINESS_RULES.EMAIL.PATTERN);

        // 3. Age 검증
        expect(user.age).toBeGreaterThanOrEqual(BUSINESS_RULES.AGE.MIN);
        expect(user.age).toBeLessThanOrEqual(BUSINESS_RULES.AGE.MAX);
        expect(Number.isInteger(user.age)).toBe(true);

        // 4. Bio 검증
        if (user.bio) {
          expect(user.bio.length).toBeLessThanOrEqual(BUSINESS_RULES.BIO.MAX_LENGTH);
        }
      });
    });
  });

  describe('경계값 및 엣지 케이스 검증', () => {
    test('데이터셋의 모든 항목은 중복된 ID를 가지지 않아야 함', () => {
      const allIds = [...testData.validUsers, ...testData.invalidUsers].map(u => u.id);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    test('비정상 데이터(invalidUsers)는 실제 비즈니스 로직에서 거부되어야 함', () => {
      testData.invalidUsers.forEach(user => {
        const isUsernameValid = 
          user.username.length >= BUSINESS_RULES.USERNAME.MIN_LENGTH && 
          user.username.length <= BUSINESS_RULES.USERNAME.MAX_LENGTH;
        
        const isEmailValid = BUSINESS_RULES.EMAIL.PATTERN.test(user.email);
        
        // 하나 이상의 조건이 실패해야 함을 검증
        const isValid = isUsernameValid && isEmailValid;
        expect(isValid).toBe(false);
      });
    });
  });
});