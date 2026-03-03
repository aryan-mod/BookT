import { useState } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      if (!item || item === 'undefined') {
        return initialValue;
      }
      return JSON.parse(item);
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silent fail: avoid crashing the app if storage is unavailable.
    }
  };

  return [storedValue, setValue];
};