/**
 * Local Storage Service - Data Access Layer
 *
 * Handles all localStorage operations with type safety and error handling.
 * Provides abstraction over browser storage API.
 */

export class LocalStorageService {
  /**
   * Get item from localStorage with type safety
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   */
  static setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
