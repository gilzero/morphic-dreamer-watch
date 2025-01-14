/**
 * @fileoverview This file defines the HistoryItem component, which
 * renders a single item in the chat history list.
 * @filepath components/history-item.tsx
 */
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Chat } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Defines the props for the HistoryItem component.
 */
type HistoryItemProps = {
  /** The chat object containing chat details. */
  chat: Chat
}

/**
 * Formats a date with time, displaying "Today", "Yesterday", or
 * the full date and time.
 * @param {Date | string} date - The date to format.
 * @returns {string} The formatted date string.
 */
const formatDateWithTime = (date: Date | string): string => {
  const parsedDate = new Date(date)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  /**
   * Formats the time of a given date.
   * @param {Date} date - The date to format.
   * @returns {string} The formatted time string.
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${formatTime(parsedDate)}`
  } else if (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday, ${formatTime(parsedDate)}`
  } else {
    return parsedDate.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
}

/**
 * Renders a single history item.
 * @param {HistoryItemProps} props - The props for the component.
 * @returns {JSX.Element} The rendered HistoryItem component.
 */
const HistoryItem: React.FC<HistoryItemProps> = ({ chat }) => {
  const pathname = usePathname()
  const isActive = pathname === chat.path

  return (
    <Link
      href={chat.path}
      className={cn(
        'flex flex-col hover:bg-muted cursor-pointer p-2 rounded border',
        isActive ? 'bg-muted/70 border-border' : 'border-transparent'
      )}
    >
      <div className="text-xs font-medium truncate select-none">
        {chat.title}
      </div>
      <div className="text-xs text-muted-foreground">
        {formatDateWithTime(chat.createdAt)}
      </div>
    </Link>
  )
}

export default HistoryItem
