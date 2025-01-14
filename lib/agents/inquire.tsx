/**
 * @fileoverview This file defines the inquire agent, which
 * uses a language model to extract structured information
 * from a conversation.
 * @filepath lib/agents/inquire.tsx
 */
import { Copilot } from '@/components/copilot'
import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { CoreMessage, streamObject } from 'ai'
import { PartialInquiry, inquirySchema } from '@/lib/schema/inquiry'
import { getModel } from '../utils/registry'
import { INQUIRE_SYSTEM_PROMPT } from '@/lib/prompts'

/**
 * Uses a language model to extract structured information
 * from a conversation.
 * @param {ReturnType<typeof createStreamableUI>} uiStream -
 *   Stream for updating the UI.
 * @param {CoreMessage[]} messages - Array of messages in the
 *   conversation.
 * @param {string} model - The model to use for the inquiry.
 * @returns {Promise<PartialInquiry>} A promise that resolves
 *   to the extracted inquiry object.
 */
export async function inquire(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[],
  model: string
): Promise<PartialInquiry> {
  const objectStream = createStreamableValue<PartialInquiry>()
  uiStream.update(<Copilot inquiry={objectStream.value} />)

  let finalInquiry: PartialInquiry = {}
  await streamObject({
    model: getModel(model),
    system: INQUIRE_SYSTEM_PROMPT,
    messages,
    schema: inquirySchema
  })
    .then(async result => {
      for await (const obj of result.partialObjectStream) {
        if (obj) {
          objectStream.update(obj)
          finalInquiry = obj
        }
      }
    })
    .finally(() => {
      objectStream.done()
    })

  return finalInquiry
}
