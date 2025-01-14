/**
 * @fileoverview This file defines the HistorySkeleton component,
 * which renders a skeleton loading state for the history section.
 * It uses the Skeleton component from the ui library.
 * @filepath components/history-skeleton.tsx
 */
import React from 'react';
import { Skeleton } from './ui/skeleton';

/**
 * Renders a skeleton loading state for the history section.
 *
 * @returns {JSX.Element} A div containing skeleton elements.
 */
export function HistorySkeleton() {
  return (
    <div className="flex flex-col flex-1 space-y-1.5 overflow-auto">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-12 rounded" />
      ))}
    </div>
  );
}
