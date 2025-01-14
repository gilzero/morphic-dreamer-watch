/**
 * @fileoverview This file contains server actions for managing the
 * workflow of AI interactions, including task management, inquiry,
 * research, and query suggestion.
 * @filepath lib/actions/workflow.tsx
 */
'use server';

import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Section } from '@/components/section';
import { FollowupPanel } from '@/components/followup-panel';
import { querySuggestor, inquire, taskManager, researcher } from '@/lib/agents';
import { createStreamableValue, createStreamableUI } from 'ai/rsc';
import { CoreMessage, generateId } from 'ai';

// TypeScript interfaces for type safety
interface UIState {
  uiStream: ReturnType<typeof createStreamableUI>;
  isCollapsed: ReturnType<typeof createStreamableValue>;
  isGenerating: ReturnType<typeof createStreamableValue>;
}

interface AIState {
  get: () => any;
  update: (state: any) => void;
  done: (state: any) => void;
}

interface ToolResult {
  result: any;
  toolName: string;
}

interface Action {
  object: { next: string };
}

/**
 * Manages the workflow of AI interactions, including task
 * management, inquiry, research, and query suggestion.
 * @param {UIState} uiState - The UI state object.
 * @param {AIState} aiState - The AI state object.
 * @param {CoreMessage[]} messages - Array of core messages.
 * @param {boolean} skip - Whether to skip task management.
 * @param {string} model - The AI model to use.
 * @returns {Promise<void>}
 */
export async function workflow(
    uiState: UIState,
    aiState: AIState,
    messages: CoreMessage[],
    skip: boolean,
    model: string
) {
  const { uiStream, isCollapsed, isGenerating } = uiState;
  const id = generateId();

  /**
   * Helper function to update AI state.
   * @param {any} updates - The updates to apply to the AI state.
   */
  const updateAIState = (updates: any) =>
    aiState.update({ ...aiState.get(), ...updates });

  /**
   * Helper function to handle completion of AI state.
   * @param {any} updates - The updates to apply to the AI state.
   */
  const completeAIState = (updates: any) =>
    aiState.done({ ...aiState.get(), ...updates });

  try {
    // Display spinner
    uiStream.append(<Spinner />);

    let action: Action = { object: { next: 'proceed' } };

    if (!skip) {
      action = (await taskManager(messages, model)) ?? action;
    }

    if (action.object.next === 'inquire') {
      const inquiry = await inquire(uiStream, messages, model);
      uiStream.done();
      completeAIState({
        messages: [
          ...aiState.get().messages,
          {
            id: generateId(),
            role: 'assistant',
            content: `inquiry: ${inquiry?.question}`,
            type: 'inquiry',
          },
        ],
      });

      isCollapsed.done(false);
      isGenerating.done(false);
      return;
    }

    isCollapsed.done(true);
    uiStream.update(null);

    const { text, toolResults } = await researcher(uiStream, messages, model);

    updateAIState({
      messages: [
        ...aiState.get().messages,
        ...toolResults.map((toolResult: ToolResult) => ({
          id,
          role: 'tool',
          content: JSON.stringify(toolResult.result),
          name: toolResult.toolName,
          type: 'tool',
        })),
        {
          id,
          role: 'assistant',
          content: text,
          type: 'answer',
        },
      ],
    });

    const messagesWithAnswer: CoreMessage[] = [
      ...messages,
      { role: 'assistant', content: text },
    ];

    const relatedQueries = await querySuggestor(uiStream, messagesWithAnswer, model);

    uiStream.append(
        <Section title="Follow-up">
          <FollowupPanel />
        </Section>
    );

    uiStream.done();
    isGenerating.done(false);

    completeAIState({
      messages: [
        ...aiState.get().messages,
        {
          id,
          role: 'assistant',
          content: JSON.stringify(relatedQueries),
          type: 'related',
        },
        {
          id,
          role: 'assistant',
          content: 'followup',
          type: 'followup',
        },
      ],
    });
  } catch (error) {
    console.error('Error in workflow:', error);
    uiStream.done();
    isGenerating.done(false);
    completeAIState({
      error: 'An error occurred during the workflow. Please try again.',
    });
  }
}
