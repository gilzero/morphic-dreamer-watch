/**
 * @fileoverview This file contains a custom React hook that provides
 * functionality to store and retrieve values from local storage.
 * 
 * @filepath lib/hooks/use-local-storage.ts
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Custom React hook to manage state synchronized with local storage.
 * 
 * @function useLocalStorage
 * @template T
 * @param {string} key - The key under which the value is stored in
 *   local storage.
 * @param {T} initialValue - The initial value to use if no value is
 *   found in local storage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} - Returns
 *   the current stored value and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      const valueToStore = storedValue
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
