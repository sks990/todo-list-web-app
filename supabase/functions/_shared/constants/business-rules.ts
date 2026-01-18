/**
 * 서비스 전반의 비즈니스 정책을 정의하는 공통 상수
 */
export const BUSINESS_RULES = {
  USER: {
    DISPLAY_NAME_MIN_LENGTH: 2,
    DISPLAY_NAME_MAX_LENGTH: 20,
    BIO_MAX_LENGTH: 160,
  },
  PROJECT: {
    MIN_TITLE_LENGTH: 5,
    MAX_TITLE_LENGTH: 100,
    MAX_MEMBER_COUNT: 50,
  },
  ORDER: {
    MIN_AMOUNT: 1000, // 최소 결제 금액
    MAX_ITEM_QUANTITY: 99,
  }
} as const;