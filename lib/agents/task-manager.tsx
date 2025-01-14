/**
 * @fileoverview This file defines the taskManager agent, which
 * determines the next action based on user input.
 * @filepath lib/agents/task-manager.tsx
 */
import { CoreMessage, generateObject } from 'ai';
import { nextActionSchema } from '../schema/next-action';
import { getModel } from '../utils/registry';
import { TASK_MANAGER_SYSTEM_PROMPT } from '@/lib/prompts';

/**
 * Determines the next action based on the provided messages.
 * @param {CoreMessage[]} messages - An array of messages.
 * @param {string} model - The model to use for generation.
 * @returns {Promise<any|null>} A promise that resolves to the
 *  generated object or null if an error occurs.
 */
export async function taskManager(
  messages: CoreMessage[],
  model: string
): Promise<any | null> {
  /**
   * Executes the task manager logic to determine the next action.
   * @returns {Promise<any|null>} A promise that resolves to the
   *  generated object or null if an error occurs.
   */
  try {
    const result = await generateObject({
      model: getModel(model),
      system: TASK_MANAGER_SYSTEM_PROMPT,
      messages,
      schema: nextActionSchema,
    });

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
