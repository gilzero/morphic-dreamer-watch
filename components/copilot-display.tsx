/**
 * @fileoverview This file defines the CopilotDisplay component, which
 * renders a card displaying a formatted query based on JSON input.
 * It handles parsing the JSON and extracting relevant data.
 * @filepath components/copilot-display.tsx
 */

'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Card } from './ui/card'
import { IconLogo } from './ui/icons'

/**
 * Defines the props for the CopilotDisplay component.
 */
interface CopilotDisplayProps {
  /** The JSON string to parse and display. */
  content: string
}

/**
 * Renders a card displaying a formatted query based on JSON input.
 *
 * @param {CopilotDisplayProps} props - The props for the component.
 * @returns {JSX.Element | null} A JSX element representing the
 *  formatted query or null if an error occurs.
 */
export function CopilotDisplay({ content }: CopilotDisplayProps) {
  try {
    const json = JSON.parse(content)
    const formDataEntries = Object.entries(json)
    const query = formDataEntries
      .filter(
        ([key, value]) =>
          value === 'on' || (key === 'additional_query' && value !== '')
      )
      .map(([key, value]) => (key === 'additional_query' ? value : key))
      .join(', ')

    return (
      <Card className="p-3 md:p-4 w-full flex justify-between items-center">
        <h5 className="text-muted-foreground text-xs truncate">{query}</h5>
        <Check size={16} className="text-green-500 w-4 h-4" />
      </Card>
    )
  } catch (error) {
    return null
  }
}
