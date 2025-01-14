/**
 * @fileoverview This file defines the querySuggestor agent, which
 * suggests related queries based on user input.
 * @filepath lib/agents/query-suggestor.tsx
 */
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamObject } from 'ai';
import { PartialRelated, relatedSchema } from '@/lib/schema/related';
import SearchRelated from '@/components/search-related';
import { getModel } from '../utils/registry';
import { QUERY_SUGGESTOR_SYSTEM_PROMPT } from '@/lib/prompts';

/**
 * Suggests related queries based on the provided messages.
 * @param {ReturnType<typeof createStreamableUI>} uiStream - The
 *   stream for UI updates.
 * @param {CoreMessage[]} messages - An array of messages.
 * @param {string} model - The model to use for generation.
 * @returns {Promise<PartialRelated>} A promise that resolves to
 *   the generated related queries.
 */
export async function querySuggestor(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[],
  model: string
): Promise<PartialRelated> {
  const objectStream = createStreamableValue<PartialRelated>();
  uiStream.append(<SearchRelated relatedQueries={objectStream.value} />);

  const lastMessages = messages.slice(-1).map(message => {
    return {
      ...message,
      role: 'user',
    };
  }) as CoreMessage[];

  let finalRelatedQueries: PartialRelated = {};
  await streamObject({
    model: getModel(model),
    system: QUERY_SUGGESTOR_SYSTEM_PROMPT,
    messages: lastMessages,
    schema: relatedSchema,
  })
    .then(async result => {
      for await (const obj of result.partialObjectStream) {
        if (obj.items) {
          objectStream.update(obj);
          finalRelatedQueries = obj;
        }
      }
    })
    .finally(() => {
      objectStream.done();
    });

  return finalRelatedQueries;
}
