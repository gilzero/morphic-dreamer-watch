/**
 * @fileoverview This file defines the researcher agent, which
 * conducts research using provided tools and returns the results.
 * @filepath lib/agents/researcher.tsx
 */
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { getTools } from './tools';
import { getModel } from '../utils/registry';
import { AnswerSection } from '@/components/answer-section';
import { RESEARCHER_SYSTEM_PROMPT } from '@/lib/prompts';

/**
 * Executes the research process using the provided model and tools.
 * @param {ReturnType<typeof createStreamableUI>} uiStream - The
 *   stream for UI updates.
 * @param {CoreMessage[]} messages - An array of messages.
 * @param {string} model - The model to use for generation.
 * @returns {Promise<{text: string, toolResults: any[]}>} A promise
 *   that resolves to an object containing the research text and
 *   any tool results.
 */
async function performResearch(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[],
  model: string
): Promise<{ text: string; toolResults: any[] }> {
  try {
    let fullResponse = '';
    const streamableText = createStreamableValue<string>();
    let toolResults: any[] = [];

    const currentDate = new Date().toLocaleString();
    const result = await streamText({
      model: getModel(model),
      system: `${RESEARCHER_SYSTEM_PROMPT} Current date and time: ${currentDate}`,
      messages: messages,
      tools: getTools({
        uiStream,
        fullResponse,
      }),
      maxSteps: 5,
      onStepFinish: async (event) => {
        if (event.stepType === 'initial') {
          if (event.toolCalls && event.toolCalls.length > 0) {
            uiStream.append(<AnswerSection result={streamableText.value} />);
            toolResults = event.toolResults;
          } else {
            uiStream.update(<AnswerSection result={streamableText.value} />);
          }
        }
      },
    });

    for await (const delta of result.fullStream) {
      if (delta.type === 'text-delta' && delta.textDelta) {
        fullResponse += delta.textDelta;
        streamableText.update(fullResponse);
      }
    }
    streamableText.done(fullResponse);
    return { text: fullResponse, toolResults };
  } catch (error) {
    console.error('Error in researcher:', error);
    return {
      text: 'An error has occurred. Please try again.',
      toolResults: [],
    };
  }
}

/**
 * Initiates the research process using the provided parameters.
 * @param {ReturnType<typeof createStreamableUI>} uiStream - The
 *   stream for UI updates.
 * @param {CoreMessage[]} messages - An array of messages.
 * @param {string} model - The model to use for generation.
 * @returns {Promise<{text: string, toolResults: any[]}>} A promise
 *   that resolves to an object containing the research text and
 *   any tool results.
 */
export async function researcher(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[],
  model: string
): Promise<{ text: string; toolResults: any[] }> {
  return performResearch(uiStream, messages, model);
}