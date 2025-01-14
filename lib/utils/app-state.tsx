/**
 * @fileoverview This file provides a context for managing
 * application-wide state, specifically for tracking the
 * generation status of AI models.
 * @filepath lib/utils/app-state.tsx
 */
'use client'

import { createContext, useState, ReactNode, useContext } from 'react'

/**
 * Context for managing application state.
 */
const AppStateContext = createContext<
  | {
      isGenerating: boolean
      setIsGenerating: (value: boolean) => void
    }
  | undefined
>(undefined)

/**
 * Provides the application state context to its children.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {JSX.Element} The provider component.
 */
export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <AppStateContext.Provider value={{ isGenerating, setIsGenerating }}>
      {children}
    </AppStateContext.Provider>
  )
}

/**
 * Hook to access the application state context.
 * @returns {object} The context value.
 * @throws {Error} If used outside of an AppStateProvider.
 */
export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}
