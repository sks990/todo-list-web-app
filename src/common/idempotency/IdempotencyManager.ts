/**
 * @file IdempotencyManager.ts
 * @description 중복 요청 방지를 위한 멱등성 관리 로직
 */

export interface IdempotencyRecord {
  key: string;
  response: any;
  status: 'PROCESSING' | 'COMPLETED';
}

export class IdempotencyManager {
  private cache: Map<string, IdempotencyRecord> = new Map();

  /**
   * 요청의 시작을 기록합니다.
   * @param key 멱등성 키 (UUID 등)
   * @returns 이미 진행 중이거나 완료된 경우 기존 레코드 반환
   */
  async startRequest(key: string): Promise<IdempotencyRecord | null> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const record: IdempotencyRecord = { key, response: null, status: 'PROCESSING' };
    this.cache.set(key, record);
    return null;
  }

  /**
   * 요청 처리가 완료되었을 때 결과를 저장합니다.
   */
  async completeRequest(key: string, response: any): Promise<void> {
    const record = this.cache.get(key);
    if (record) {
      record.status = 'COMPLETED';
      record.response = response;
    }
  }
}