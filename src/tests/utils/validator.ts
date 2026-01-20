/**
 * JSON 데이터 구조 및 유효성 검증 유틸리티
 */
export const validateTestData = (data: any) => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid JSON: Root element must be an object');
  }

  // 필수 속성 체크 (Acceptance Criteria)
  const requiredKeys = ['users', 'products', 'metadata'];
  requiredKeys.forEach(key => {
    if (!(key in data)) {
      throw new Error(`Missing required key: ${key}`);
    }
  });

  // 런타임 코드 포함 여부 정밀 검사 (Edge case: 문자열 내에 JavaScript 구문 잔존 여부)
  const stringified = JSON.stringify(data);
  const runtimePatterns = [/\.padEnd\(/, /\.padStart\(/, /\.slice\(/, /=>/];
  
  runtimePatterns.forEach(pattern => {
    if (pattern.test(stringified)) {
      throw new Error(`Security/Syntax Alert: Potential runtime code detected in static JSON: ${pattern}`);
    }
  });

  return true;
};