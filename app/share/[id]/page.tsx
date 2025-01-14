/**
 * @fileoverview This file defines the SharePage component and its associated
 * functions. It handles the retrieval and display of shared chat data based
 * on a given ID parameter.
 * 
 * @filepath app/share/[id]/page.tsx
 */

import { notFound } from 'next/navigation'
import { Chat } from '@/components/chat'
import { getSharedChat } from '@/lib/actions/chat'
import { AI } from '@/app/actions'

export interface SharePageProps {
  params: {
    id: string
  }
}

/**
 * Generates metadata for the SharePage component.
 * 
 * @param {SharePageProps} params - The parameters containing the chat ID.
 * @returns {Promise<Object>} Metadata object with a title or triggers a
 * notFound response if the chat is not found.
 */
export async function generateMetadata({ params }: SharePageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat.sharePath) {
    return notFound()
  }

  return {
    title: chat?.title.toString().slice(0, 50) || 'Search'
  }
}

/**
 * The SharePage component fetches and displays a shared chat based on the
 * provided ID.
 * 
 * @param {SharePageProps} params - The parameters containing the chat ID.
 * @returns {Promise<JSX.Element>} A JSX element rendering the AI component
 * with the Chat component inside, or triggers a notFound response if the
 * chat is not found.
 */
export default async function SharePage({ params }: SharePageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat.sharePath) {
    notFound()
  }

  return (
    <AI
      initialAIState={{
        chatId: chat.id,
        messages: chat.messages,
        isSharePage: true
      }}
    >
      <Chat id={params.id} />
    </AI>
  )
}
