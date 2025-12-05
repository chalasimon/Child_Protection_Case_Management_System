// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state with localStorage persistence
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value
 * @returns {Object} - Object containing value and methods to manage it
 */
const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initial value
  const readValue = useCallback(() => {
    try {
      // Check if window is available (for SSR)
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue);

  // Initialize on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  /**
   * Set a new value to localStorage and update state
   * @param {any} value - The value to store
   */
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Dispatch storage event for other tabs/windows
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
            oldValue: JSON.stringify(storedValue)
          })
        );
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  /**
   * Remove the value from localStorage and reset to initial value
   */
  const removeValue = useCallback(() => {
    try {
      const oldValue = storedValue;
      
      // Reset state to initial value
      setStoredValue(initialValue);
      
      // Remove from localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch storage event
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            oldValue: JSON.stringify(oldValue)
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, storedValue, initialValue]);

  /**
   * Clear all localStorage items (optional)
   */
  const clearStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        
        // Reset state to initial value
        setStoredValue(initialValue);
        
        // Dispatch storage event for all keys
        window.dispatchEvent(new StorageEvent('storage', {}));
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  /**
   * Get all localStorage keys with a specific prefix
   * @param {string} prefix - The prefix to filter keys
   * @returns {Array} - Array of keys
   */
  const getKeysWithPrefix = useCallback((prefix) => {
    try {
      if (typeof window !== 'undefined') {
        return Object.keys(window.localStorage).filter(key => 
          key.startsWith(prefix)
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }, []);

  /**
   * Check if a key exists in localStorage
   * @param {string} checkKey - The key to check
   * @returns {boolean} - Whether the key exists
   */
  const hasKey = useCallback((checkKey) => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(checkKey) !== null;
      }
      return false;
    } catch (error) {
      console.error('Error checking localStorage key:', error);
      return false;
    }
  }, []);

  /**
   * Get multiple items by keys
   * @param {Array} keys - Array of keys to retrieve
   * @returns {Object} - Object with key-value pairs
   */
  const getMultiple = useCallback((keys) => {
    try {
      if (typeof window !== 'undefined') {
        return keys.reduce((acc, key) => {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) {
              acc[key] = JSON.parse(value);
            }
          } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
          }
          return acc;
        }, {});
      }
      return {};
    } catch (error) {
      console.error('Error getting multiple localStorage items:', error);
      return {};
    }
  }, []);

  /**
   * Set multiple items at once
   * @param {Object} items - Object with key-value pairs to store
   */
  const setMultiple = useCallback((items) => {
    try {
      if (typeof window !== 'undefined') {
        Object.entries(items).forEach(([itemKey, value]) => {
          const oldValue = window.localStorage.getItem(itemKey);
          window.localStorage.setItem(itemKey, JSON.stringify(value));
          
          // Dispatch storage event for each key
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: itemKey,
              newValue: JSON.stringify(value),
              oldValue: oldValue
            })
          );
        });
      }
      
      // Update the current key if it's in the items
      if (items[key] !== undefined) {
        setStoredValue(items[key]);
      }
    } catch (error) {
      console.error('Error setting multiple localStorage items:', error);
    }
  }, [key]);

  /**
   * Subscribe to localStorage changes (cross-tab/window)
   * @param {Function} callback - Function to call when storage changes
   * @returns {Function} - Cleanup function to remove listener
   */
  const subscribe = useCallback((callback) => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          callback(newValue, event.oldValue ? JSON.parse(event.oldValue) : null);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
    
    return () => {};
  }, [key, initialValue]);

  /**
   * Get the raw string value from localStorage (without parsing)
   * @returns {string|null} - The raw string value
   */
  const getRawValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.error(`Error getting raw localStorage value for key "${key}":`, error);
      return null;
    }
  }, [key]);

  /**
   * Set a raw string value to localStorage (without stringifying)
   * @param {string} value - The string value to store
   */
  const setRawValue = useCallback((value) => {
    try {
      if (typeof window !== 'undefined') {
        const oldValue = window.localStorage.getItem(key);
        window.localStorage.setItem(key, value);
        setStoredValue(value);
        
        // Dispatch storage event
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: value,
            oldValue: oldValue
          })
        );
      }
    } catch (error) {
      console.error(`Error setting raw localStorage value for key "${key}":`, error);
    }
  }, [key]);

  /**
   * Get the size of the stored value in bytes
   * @returns {number} - Size in bytes
   */
  const getSize = useCallback(() => {
    try {
      const value = getRawValue();
      return value ? new Blob([value]).size : 0;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }, [getRawValue]);

  /**
   * Check if localStorage has enough space for a value
   * @param {any} value - The value to check
   * @returns {boolean} - Whether there's enough space
   */
  const hasSpaceFor = useCallback((value) => {
    try {
      const valueString = JSON.stringify(value);
      const size = new Blob([valueString]).size;
      
      // Check if we have at least 5MB available (common localStorage limit is 5-10MB)
      const availableSpace = 5 * 1024 * 1024; // 5MB
      const usedSpace = Object.keys(window.localStorage).reduce((total, key) => {
        const item = window.localStorage.getItem(key);
        return total + new Blob([item]).size;
      }, 0);
      
      return (usedSpace + size) < availableSpace;
    } catch (error) {
      console.error('Error checking storage space:', error);
      return false;
    }
  }, []);

  return {
    // Current value
    value: storedValue,
    
    // Basic operations
    setValue,
    removeValue,
    clearStorage,
    
    // Advanced operations
    getKeysWithPrefix,
    hasKey,
    getMultiple,
    setMultiple,
    
    // Subscription
    subscribe,
    
    // Raw operations
    getRawValue,
    setRawValue,
    
    // Utility
    getSize,
    hasSpaceFor,
    
    // Alias for convenience
    get: () => storedValue,
    set: setValue,
    remove: removeValue,
    clear: clearStorage,
  };
};

/**
 * Hook for storing string values (no JSON parsing)
 */
export const useLocalStorageString = (key, initialValue = '') => {
  const readValue = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, valueToStore);
        
        // Dispatch storage event
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: valueToStore,
            oldValue: storedValue
          })
        );
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      const oldValue = storedValue;
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch storage event
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: null,
            oldValue: oldValue
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, storedValue, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    
    // Utility methods
    isEmpty: storedValue === '',
    length: storedValue.length,
    includes: (searchString) => storedValue.includes(searchString),
    startsWith: (searchString) => storedValue.startsWith(searchString),
    endsWith: (searchString) => storedValue.endsWith(searchString),
  };
};

/**
 * Hook for storing boolean values
 */
export const useLocalStorageBoolean = (key, initialValue = false) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, [setValue]);

  return {
    value: Boolean(value),
    setValue,
    toggle,
    removeValue,
    isTrue: Boolean(value),
    isFalse: !Boolean(value),
  };
};

/**
 * Hook for storing number values
 */
export const useLocalStorageNumber = (key, initialValue = 0) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  
  const increment = useCallback((amount = 1) => {
    setValue(prev => {
      const num = Number(prev);
      return isNaN(num) ? amount : num + amount;
    });
  }, [setValue]);

  const decrement = useCallback((amount = 1) => {
    setValue(prev => {
      const num = Number(prev);
      return isNaN(num) ? -amount : num - amount;
    });
  }, [setValue]);

  const multiply = useCallback((factor = 2) => {
    setValue(prev => {
      const num = Number(prev);
      return isNaN(num) ? factor : num * factor;
    });
  }, [setValue]);

  const divide = useCallback((divisor = 2) => {
    setValue(prev => {
      const num = Number(prev);
      return isNaN(num) || divisor === 0 ? prev : num / divisor;
    });
  }, [setValue]);

  return {
    value: Number(value) || initialValue,
    setValue,
    removeValue,
    increment,
    decrement,
    multiply,
    divide,
    
    // Utility methods
    isPositive: (Number(value) || initialValue) > 0,
    isNegative: (Number(value) || initialValue) < 0,
    isZero: (Number(value) || initialValue) === 0,
    isInteger: Number.isInteger(Number(value) || initialValue),
  };
};

/**
 * Hook for storing array values
 */
export const useLocalStorageArray = (key, initialValue = []) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  
  const push = useCallback((item) => {
    setValue(prev => [...prev, item]);
  }, [setValue]);

  const pop = useCallback(() => {
    setValue(prev => {
      if (prev.length === 0) return prev;
      const newArray = [...prev];
      newArray.pop();
      return newArray;
    });
  }, [setValue]);

  const remove = useCallback((index) => {
    setValue(prev => prev.filter((_, i) => i !== index));
  }, [setValue]);

  const update = useCallback((index, item) => {
    setValue(prev => prev.map((val, i) => i === index ? item : val));
  }, [setValue]);

  const clear = useCallback(() => {
    setValue([]);
  }, [setValue]);

  const find = useCallback((predicate) => {
    const array = Array.isArray(value) ? value : initialValue;
    return array.find(predicate);
  }, [value, initialValue]);

  const filter = useCallback((predicate) => {
    const array = Array.isArray(value) ? value : initialValue;
    return array.filter(predicate);
  }, [value, initialValue]);

  const map = useCallback((callback) => {
    const array = Array.isArray(value) ? value : initialValue;
    return array.map(callback);
  }, [value, initialValue]);

  return {
    value: Array.isArray(value) ? value : initialValue,
    setValue,
    removeValue,
    
    // Array methods
    push,
    pop,
    remove,
    update,
    clear,
    find,
    filter,
    map,
    
    // Utility methods
    length: Array.isArray(value) ? value.length : 0,
    isEmpty: Array.isArray(value) ? value.length === 0 : true,
    includes: (item) => Array.isArray(value) ? value.includes(item) : false,
    indexOf: (item) => Array.isArray(value) ? value.indexOf(item) : -1,
  };
};

/**
 * Hook for storing object values
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  
  const updateField = useCallback((field, fieldValue) => {
    setValue(prev => ({
      ...prev,
      [field]: fieldValue
    }));
  }, [setValue]);

  const removeField = useCallback((field) => {
    setValue(prev => {
      const newValue = { ...prev };
      delete newValue[field];
      return newValue;
    });
  }, [setValue]);

  const merge = useCallback((object) => {
    setValue(prev => ({
      ...prev,
      ...object
    }));
  }, [setValue]);

  const getField = useCallback((field, defaultValue = null) => {
    const obj = typeof value === 'object' && value !== null ? value : initialValue;
    return obj[field] !== undefined ? obj[field] : defaultValue;
  }, [value, initialValue]);

  const hasField = useCallback((field) => {
    const obj = typeof value === 'object' && value !== null ? value : initialValue;
    return field in obj;
  }, [value, initialValue]);

  const keys = useCallback(() => {
    const obj = typeof value === 'object' && value !== null ? value : initialValue;
    return Object.keys(obj);
  }, [value, initialValue]);

  const values = useCallback(() => {
    const obj = typeof value === 'object' && value !== null ? value : initialValue;
    return Object.values(obj);
  }, [value, initialValue]);

  return {
    value: typeof value === 'object' && value !== null ? value : initialValue,
    setValue,
    removeValue,
    
    // Object methods
    updateField,
    removeField,
    merge,
    getField,
    hasField,
    keys,
    values,
    
    // Utility methods
    size: Object.keys(typeof value === 'object' && value !== null ? value : initialValue).length,
    isEmpty: Object.keys(typeof value === 'object' && value !== null ? value : initialValue).length === 0,
  };
};

/**
 * Hook for storing session-specific data (cleared on tab close)
 */
export const useSessionStorage = (key, initialValue) => {
  const readValue = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    get: () => storedValue,
    set: setValue,
    remove: removeValue,
  };
};

export default useLocalStorage;