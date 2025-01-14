/**
 * @fileoverview Provides a theme context to the application using
 * next-themes. This allows for easy switching between light and dark
 * modes.
 * @filepath components/theme-provider.tsx
 */
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * Provides a theme context to the application.
 *
 * @param {ThemeProviderProps} props - The props for the
 *   ThemeProvider.
 * @param {React.ReactNode} props.children - The children to
 *   render within the theme provider.
 * @returns {JSX.Element} A ThemeProvider component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
