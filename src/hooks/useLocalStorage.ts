import { useState, useEffect } from 'react';

/**
 * LocalStorage와 상태를 동기화하는 커스텀 훅
 * @param key 로컬 스토리지에 저장될 키
 * @param initialValue 초기값
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 초기 상태 설정
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`LocalStorage read error (key: ${key}):`, error);
      return initialValue;
    }
  });

  // 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`LocalStorage write error (key: ${key}):`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}