/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Memory fallback store for localStorage
const localMemoryStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.warn(`localStorage is not accessible for key "${key}", using memory fallback.`, e);
      return localMemoryStore[key] !== undefined ? localMemoryStore[key] : null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        localMemoryStore[key] = value;
      }
    } catch (e) {
      console.warn(`localStorage is not accessible for key "${key}", using memory fallback.`, e);
      localMemoryStore[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete localMemoryStore[key];
      }
    } catch (e) {
      console.warn(`localStorage is not accessible for key "${key}", using memory fallback.`, e);
      delete localMemoryStore[key];
    }
  }
};

// Memory fallback store for sessionStorage
const sessionMemoryStore: Record<string, string> = {};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      return window.sessionStorage ? window.sessionStorage.getItem(key) : null;
    } catch (e) {
      console.warn(`sessionStorage is not accessible for key "${key}", using memory fallback.`, e);
      return sessionMemoryStore[key] !== undefined ? sessionMemoryStore[key] : null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      } else {
        sessionMemoryStore[key] = value;
      }
    } catch (e) {
      console.warn(`sessionStorage is not accessible for key "${key}", using memory fallback.`, e);
      sessionMemoryStore[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      } else {
        delete sessionMemoryStore[key];
      }
    } catch (e) {
      console.warn(`sessionStorage is not accessible for key "${key}", using memory fallback.`, e);
      delete sessionMemoryStore[key];
    }
  }
};
