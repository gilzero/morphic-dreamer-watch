/**
 * @fileoverview This file defines the main page component for the
 * application, rendering a chat interface within an AI context.
 * It initializes the chat with a unique ID and manages the AI state.
 */
/**
 * @filepath app/page.tsx
 */
import { Chat } from '@/components/chat';
import { generateId } from 'ai';
import { AI } from './actions';

export const maxDuration = 60;

/**
 * The main page component of the application.
 * @returns {JSX.Element} The rendered page component.
 */
export default function Page() {
  /**
   * Generates a unique ID for the chat.
   * @type {string}
   */
  const id = generateId();
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} />
    </AI>
  );
}
