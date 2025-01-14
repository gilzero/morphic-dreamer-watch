/**
 * @fileoverview This file defines the HistoryList component, which
 * displays a list of chat history items. It fetches chat data
 * and renders each chat as a HistoryItem.
 * @filepath components/history-list.tsx
 */
import React, { cache } from 'react'
import HistoryItem from './history-item'
import { Chat } from '@/lib/types'
import { getChats } from '@/lib/actions/chat'
import { ClearHistory } from './clear-history'

type HistoryListProps = {
  /** The ID of the user whose chat history to display. */
  userId?: string
}

/**
 * Fetches the chat history for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Chat[]>} A promise that resolves to an array
 * of chat objects.
 */
const loadChats = cache(async (userId?: string) => {
  return await getChats(userId)
})

/**
 * Renders a list of chat history items.
 * @param {HistoryListProps} props - The component props.
 * @returns {JSX.Element} A div containing the list of history items.
 */
export async function HistoryList({ userId }: HistoryListProps) {
  const chats = await loadChats(userId)

  return (
    <div className="flex flex-col flex-1 space-y-3 h-full">
      <div className="flex flex-col space-y-0.5 flex-1 overflow-y-auto">
        {!chats?.length ? (
          <div className="text-foreground/30 text-sm text-center py-4">
            No search history
          </div>
        ) : (
          chats?.map(
            (chat: Chat) => chat && <HistoryItem key={chat.id} chat={chat} />
          )
        )}
      </div>
      <div className="mt-auto">
        <ClearHistory empty={!chats?.length} />
      </div>
    </div>
  )
}
