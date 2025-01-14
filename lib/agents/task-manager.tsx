import { CoreMessage, generateObject } from 'ai'
import { nextActionSchema } from '../schema/next-action'
import { getModel } from '../utils/registry'
import { TASK_MANAGER_SYSTEM_PROMPT } from '@/lib/prompts'

// Decide whether inquiry is required for the user input
export async function taskManager(messages: CoreMessage[], model: string) {
  try {
    const result = await generateObject({
      model: getModel(model),
      system: TASK_MANAGER_SYSTEM_PROMPT,
      messages,
      schema: nextActionSchema
    })

    return result
  } catch (error) {
    console.error(error)
    return null
  }
}
