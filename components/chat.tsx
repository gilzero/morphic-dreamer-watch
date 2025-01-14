/**
 * @fileoverview This file defines the Chat component, which
 * renders a chat interface with messages and a chat panel.
 * It manages navigation and state for the chat.
 * @filepath components/chat.tsx
 */
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChatPanel } from './chat-panel';
import { ChatMessages } from './chat-messages';
import { useUIState } from 'ai/rsc';

type ChatProps = {
  id?: string;
  query?: string;
};

/**
 * Chat component that renders the chat interface.
 * It handles navigation and displays messages.
 * @param {ChatProps} props - The properties for the Chat component.
 * @param {string} props.id - The ID of the chat.
 * @param {string} props.query - The initial query for the chat.
 * @returns {JSX.Element} The rendered Chat component.
 */
export function Chat({ id, query }: ChatProps) {
  const path = usePathname();
  const [messages] = useUIState();

  useEffect(() => {
    /**
     * Effect to update the URL when a new chat is started.
     * It checks if the path doesn't include 'search' and if
     * there's only one message, then updates the URL.
     */
    if (!path.includes('search') && messages.length === 1) {
      window.history.replaceState({}, '', `/search/${id}`);
    }
  }, [id, path, messages, query]);

  return (
      <div className="px-4 sm:px-8 md:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-3xl mx-auto flex flex-col space-y-3 md:space-y-4">
        <ChatMessages messages={messages} />
        <ChatPanel messages={messages} query={query} />
      </div>
  );
}