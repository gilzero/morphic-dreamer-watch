/**
 * @fileoverview This file defines the ChatPanel component, which
 * provides a user interface for interacting with an AI model. It
 * handles user input, displays messages, and manages the state of
 * the chat interface.
 * @filepath components/chat-panel.tsx
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AI, UIState } from '@/app/actions';
import { useUIState, useActions, useAIState } from 'ai/rsc';
import { cn } from '@/lib/utils';
import { UserMessage } from './user-message';
import { Button } from './ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { EmptyScreen } from './empty-screen';
import Textarea from 'react-textarea-autosize';
import { generateId } from 'ai';
import { useAppState } from '@/lib/utils/app-state';
import { ModelSelector } from './model-selector';
import { models } from '@/lib/types/models';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { getDefaultModelId } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';

interface ChatPanelProps {
  messages: UIState;
  query?: string;
  onModelChange?: (id: string) => void;
}

/**
 * ChatPanel component provides the main chat interface.
 *
 * @param {ChatPanelProps} props - The component props.
 * @param {UIState} props.messages - The list of messages.
 * @param {string} [props.query] - Initial query string.
 * @param {function} [props.onModelChange] - Callback for model change.
 * @returns {JSX.Element} The ChatPanel component.
 */
export function ChatPanel({ messages, query, onModelChange }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [, setMessages] = useUIState<typeof AI>();
  const [aiMessage, setAIMessage] = useAIState<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { submit } = useActions();
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isFirstRender = useRef(true);

  const [selectedModelId, setSelectedModelId] = useLocalStorage<string>(
    'selectedModel',
    getDefaultModelId(models)
  );

  const [isComposing, setIsComposing] = useState(false);
  const [enterDisabled, setEnterDisabled] = useState(false);

  /**
   * Handles the start of IME composition.
   */
  const handleCompositionStart = () => setIsComposing(true);

  /**
   * Handles the end of IME composition.
   */
  const handleCompositionEnd = () => {
    setIsComposing(false);
    setEnterDisabled(true);
    setTimeout(() => {
      setEnterDisabled(false);
    }, 300);
  };

  /**
   * Submits the user's query to the AI model.
   *
   * @param {string} query - The user's input query.
   * @param {FormData} [formData] - Optional form data.
   * @returns {Promise<void>}
   */
  async function handleQuerySubmit(query: string, formData?: FormData) {
    setInput(query);
    setIsGenerating(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: generateId(),
        component: <UserMessage message={query} />,
      },
    ]);

    const data = formData || new FormData();
    const modelString = selectedModelId;
    data.set('model', modelString);

    if (!formData) {
      data.set('input', query);
    }

    const responseMessage = await submit(data);
    setMessages((currentMessages) => [...currentMessages, responseMessage]);
  }

  /**
   * Handles the form submission.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await handleQuerySubmit(input, formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`${error}`);
      handleClear();
    }
  };

  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      handleQuerySubmit(query);
      isFirstRender.current = false;
    }
  }, [query]);

  useEffect(() => {
    const lastMessage = aiMessage.messages.slice(-1)[0];
    if (lastMessage?.type === 'followup' || lastMessage?.type === 'inquiry') {
      setIsGenerating(false);
    }
  }, [aiMessage, setIsGenerating]);

  /**
   * Clears the chat messages and resets the input.
   */
  const handleClear = () => {
    setIsGenerating(false);
    setMessages([]);
    setAIMessage({ messages: [], chatId: '' });
    setInput('');
    router.push('/');
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (messages.length > 0) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto pointer-events-none">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
          onClick={() => handleClear()}
          disabled={isGenerating}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    );
  }

  if (query && query.trim().length > 0) {
    return null;
  }

  return (
    <div
      className={
        'fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center'
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6">
        <div className="relative flex items-center w-full">
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelChange={(id) => {
              setSelectedModelId(id);
              onModelChange?.(id);
            }}
          />
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Ask me anything about watches..."
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-14 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => {
              setInput(e.target.value);
              setShowEmptyScreen(e.target.value.length === 0);
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                const textarea = e.target as HTMLTextAreaElement;
                textarea.form?.requestSubmit();
              }
            }}
            onHeightChange={(height) => {
              if (!inputRef.current) return;

              const initialHeight = 70;
              const initialBorder = 32;
              const multiple = (height - initialHeight) / 20;

              const newBorder = initialBorder - 4 * multiple;
              inputRef.current.style.borderRadius =
                Math.max(8, newBorder) + 'px';
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0 || isGenerating}
          >
            {isGenerating ? <Spinner /> : <ArrowRight size={20} />}
          </Button>
        </div>
        <EmptyScreen
          submitMessage={(message) => {
            setInput(message);
          }}
          className={cn(showEmptyScreen ? 'visible' : 'invisible')}
        />
      </form>
    </div>
  );
}