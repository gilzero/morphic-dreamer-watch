/**
 * @fileoverview This file defines the ErrorCard component, which
 * renders a card displaying an error message and a retry button.
 * @filepath components/error-card.tsx
 */
'use client'

import React from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { RefreshCcw } from 'lucide-react'
import { Label } from './ui/label'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { AI } from '@/app/actions'
import { AIMessage } from '@/lib/types'

/**
 * Defines the props for the ErrorCard component.
 */
type ErrorCardProps = {
  /** The error message to display. */
  errorMessage: string
}

/**
 * Renders a card displaying an error message and a retry button.
 *
 * @param {ErrorCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({
  errorMessage
}) => {
  const [messages, setMessages] = useUIState<typeof AI>()
  const [aiState, setAIState] = useAIState<typeof AI>()
  const { submit } = useActions()

  /**
   * Handles the retry action. It removes the last message from the
   * UI state, retrieves the last user message, and resubmits the
   * inquiry.
   *
   * @returns {Promise<void>} A promise that resolves when the retry
   *  action is complete.
   */
  const handleRetry = async () => {
    setMessages(messages.slice(0, -1))

    const aiMessages = aiState.messages
    const lastUserMessage = [...aiMessages]
      .reverse()
      .find(m => m.role === 'user')

    let retryMessages: AIMessage[] = []
    if (lastUserMessage) {
      const lastUserMessageIndex = aiMessages.findIndex(
        m => m === lastUserMessage
      )
      retryMessages = aiMessages.slice(0, lastUserMessageIndex + 1)
    }
    const response = await submit(undefined, false, retryMessages)
    setMessages(currentMessages => [...currentMessages, response])
  }

  return (
    <Card className="p-4">
      <form
        className="flex flex-col items-center space-y-4"
        action={handleRetry}
      >
        <Label>{errorMessage}</Label>
        <Button size="sm" className="w-fit" type="submit">
          <RefreshCcw size={14} className="mr-1" />
          Retry
        </Button>
      </form>
    </Card>
  )
}
