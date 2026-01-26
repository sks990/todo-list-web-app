/**
 * @file OutboxMessageRelay.ts
 * @description 데이터베이스 트랜잭션과 메시지 발행의 원자성을 보장하기 위한 Outbox 패턴 구현
 */

export interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  type: string;
  payload: any;
  processed: boolean;
}

export class OutboxService {
  constructor(private readonly dbRepo: any, private readonly messageBroker: any) {}

  /**
   * 트랜잭션 내에서 이벤트를 저장합니다.
   */
  async saveEvent(event: Omit<OutboxEvent, 'id' | 'processed'>, transaction: any) {
    await this.dbRepo.outbox.create({ data: event, transaction });
  }

  /**
   * 백그라운드 프로세스로 미처리된 메시지를 브로커에 전달합니다.
   */
  async relayMessages() {
    const pendingEvents = await this.dbRepo.outbox.findMany({ where: { processed: false } });

    for (const event of pendingEvents) {
      try {
        await this.messageBroker.publish(event.type, event.payload);
        await this.dbRepo.outbox.update({
          where: { id: event.id },
          data: { processed: true }
        });
      } catch (error) {
        console.error(`Failed to relay event ${event.id}:`, error);
        // 지수 백오프 로직 적용 가능
      }
    }
  }
}