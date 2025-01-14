/**
 * @fileoverview This file contains a custom React hook that provides
 * functionality to copy text to the clipboard and manage the copied state.
 * 
 * @filepath lib/hooks/use-copy-to-clipboard.ts
 */

'use client'

import { useState } from 'react'

/**
 * Interface for useCopyToClipboard hook properties.
 * 
 * @interface useCopyToClipboardProps
 * @property {number} [timeout] - Duration in milliseconds for which the copied
 * state is maintained.
 */
export interface useCopyToClipboardProps {
  timeout?: number
}

/**
 * Custom React hook to copy text to the clipboard and manage the copied state.
 * 
 * @function useCopyToClipboard
 * @param {useCopyToClipboardProps} props - Properties for the hook.
 * @returns {Object} - An object containing the copied state and the function
 * to copy text to the clipboard.
 */
export function useCopyToClipboard({
  timeout = 2000
}: useCopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState<Boolean>(false)

  /**
   * Copies the provided text to the clipboard and updates the copied state.
   * 
   * @function copyToClipboard
   * @param {string} value - The text to be copied to the clipboard.
   */
  const copyToClipboard = (value: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      return
    }

    if (!value) {
      return
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    })
  }

  return { isCopied, copyToClipboard }
}
