export const BUSINESS_RULES = {
  USERNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9가-힣]+$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  AGE: {
    MIN: 0,
    MAX: 120
  },
  BIO: {
    MAX_LENGTH: 200
  }
};