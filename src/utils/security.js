/**
 * UI Security 및 데이터 처리를 위한 유틸리티
 */

export const SecurityUtils = {
  /**
   * 요소를 안전하게 렌더링 (XSS 방지)
   * @param {HTMLElement} element - 대상 엘리먼트
   * @param {string} text - 렌더링할 텍스트
   */
  safeRenderText(element, text) {
    if (!element) return;
    element.textContent = text;
  },

  /**
   * LocalStorage에서 안전하게 데이터를 가져옴
   * @param {string} key - 저장소 키
   * @param {any} defaultValue - 기본값
   */
  getSecureStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`[Storage Error] Failed to parse key "${key}":`, error);
      // 오염된 데이터가 있을 경우 초기화하거나 기본값 반환
      return defaultValue;
    }
  },

  /**
   * 데이터를 LocalStorage에 안전하게 저장
   */
  setSecureStorage(key, value) {
    try {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
    } catch (error) {
      console.error(`[Storage Error] Failed to save key "${key}":`, error);
    }
  }
};