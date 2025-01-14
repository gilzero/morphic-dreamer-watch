/**
 * @fileoverview This file defines the DefaultSkeleton
 * component, which renders a basic skeleton loading
 * UI using the Skeleton component.
 * @filepath components/default-skeleton.tsx
 */

'use client'

import React from 'react'
import { Skeleton } from './ui/skeleton'

/**
 * DefaultSkeleton component.
 *
 * Renders a basic skeleton loading UI with two
 * skeleton elements.
 *
 * @returns {JSX.Element} The skeleton UI.
 */
export const DefaultSkeleton = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-2 pb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="w-full h-6" />
    </div>
  )
}
