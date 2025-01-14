/**
 * @fileoverview This file defines the ChatMessages component, which
 * renders a list of chat messages, grouping messages by ID and
 * using CollapsibleMessage for display.
 * @filepath components/chat-messages.tsx
 */
'use client'

import { StreamableValue } from 'ai/rsc'
import type { UIState } from '@/app/actions'
import { CollapsibleMessage } from './collapsible-message'

/**
 * Defines the props for the ChatMessages component.
 */
interface ChatMessagesProps {
  /** An array of messages to display. */
  messages: UIState
}

/**
 * Defines the structure of a grouped message.
 */
type GroupedMessage = {
  /** The ID of the message group. */
  id: string
  /** An array of React components within the message group. */
  components: React.ReactNode[]
  /** Indicates if the message group is collapsed. */
  isCollapsed?: StreamableValue<boolean> | undefined
}

/**
 * Renders a list of chat messages, grouping messages by ID.
 * @param {ChatMessagesProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered component or null if no
 * messages.
 */
export function ChatMessages({ messages }: ChatMessagesProps) {
  if (!messages.length) {
    return null
  }

  /**
   * Groups messages by ID, combining components of messages with the
   * same ID.
   */
  const groupedMessages = messages.reduce(
    (acc: { [key: string]: GroupedMessage }, message) => {
      if (!acc[message.id]) {
        acc[message.id] = {
          id: message.id,
          components: [],
          isCollapsed: message.isCollapsed
        }
      }
      acc[message.id].components.push(message.component)
      return acc
    },
    {}
  )

  /**
   * Converts the grouped messages object into an array with explicit
   * type.
   */
  const groupedMessagesArray = Object.values(groupedMessages).map(
    (group) => ({
      ...group,
      components: group.components as React.ReactNode[]
    })
  ) as {
    id: string
    components: React.ReactNode[]
    isCollapsed?: StreamableValue<boolean>
  }[]

  return (
    <>
      {groupedMessagesArray.map((groupedMessage: GroupedMessage) => (
        <CollapsibleMessage
          key={`${groupedMessage.id}`}
          message={{
            id: groupedMessage.id,
            component: groupedMessage.components.map((component, i) => (
              <div key={`${groupedMessage.id}-${i}`}>{component}</div>
            )),
            isCollapsed: groupedMessage.isCollapsed
          }}
          isLastMessage={
            groupedMessage.id === messages[messages.length - 1].id
          }
        />
      ))}
    </>
  )
}
