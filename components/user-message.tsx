/**
 * @fileoverview This file defines the UserMessage component,
 * which renders a user's message with an optional share button.
 * @filepath components/user-message.tsx
 */
import React from 'react'
import { ChatShare } from './chat-share'

/**
 * Defines the props for the UserMessage component.
 */
type UserMessageProps = {
  /** The message content to display. */
  message: string
  /** The ID of the chat, used for sharing. */
  chatId?: string
  /** Whether to show the share button. */
  showShare?: boolean
}

/**
 * Renders a user message with an optional share button.
 * @param {UserMessageProps} props - The props for the component.
 * @returns {JSX.Element} A div containing the user message.
 */
export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  chatId,
  showShare = false
}) => {
  const enableShare = process.env.ENABLE_SHARE === 'true'
  return (
    <div className="flex items-center w-full space-x-1 mt-2 min-h-10">
      <div className="text-xl flex-1 break-words w-full">{message}</div>
      {enableShare && showShare && chatId && <ChatShare chatId={chatId} />}
    </div>
  )
}
