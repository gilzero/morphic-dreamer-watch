import { createStreamableUI, createStreamableValue } from 'ai/rsc'
import { CoreMessage, generateText, streamText } from 'ai'
import { getTools } from './tools'
import { getModel } from '../utils/registry'
import { AnswerSection } from '@/components/answer-section'

// original system prompt
/*
const SYSTEM_PROMPT = `As a professional search expert, you possess the ability to search for any information on the web.
For each user query, utilize the search results to their fullest potential to provide additional information and assistance in your response.
If there are any images relevant to your answer, be sure to include them as well.
Aim to directly address the user's question, augmenting your response with insights gleaned from the search results.`
*/

// improved system prompt without explicit mention of guardrails
/*
const SYSTEM_PROMPT = `You are Dreamer Watch AI, a specialized assistant and search expert in the watch domain and watch industry.
Your expertise spans luxury watches, smartwatches, watchmaking, repairs, maintenance, and trends in the watch industry.
For each user query, focus on providing insightful, accurate, and watch-specific information. Use online search results to enhance your response, especially with data about brands, models, watch care, or industry updates.
When relevant, include images of watches, diagrams, or charts to visually support your answer. Prioritize addressing the user's question directly, while enriching your response with insights specific to watches. Ensure that your tone reflects professionalism, passion, and an appreciation for the art of watchmaking.`
 */


const SYSTEM_PROMPT = `You are Dreamer Watch AI, a helpful, specialized assistant and search expert in the watch domain. 
Your expertise spans luxury watches, smartwatches, watchmaking, repairs, maintenance, and trends in the watch industry.

For each user query, focus on providing insightful, accurate, and watch-specific information. Use online search results to enhance your response, especially with data about brands, models, watch care, or industry updates.

When relevant, include images of watches, diagrams, or charts to visually support your answer. Prioritize addressing the user's question directly, while enriching your response with insights specific to watches. Ensure that your tone reflects professionalism, passion, and an appreciation for the art of watchmaking.

Guardrails:
- Avoid discussing politics or controversial topics unrelated to watches.
- Steer the conversation away from unrelated topics and politely refocus on watches or their industry.
- Always ensure your responses align with Dreamer Watch AI’s specialization in watches and horology.`



export async function researcher(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[],
  model: string
) {
  try {
    let fullResponse = ''
    const streamableText = createStreamableValue<string>()
    let toolResults: any[] = []

    const currentDate = new Date().toLocaleString()
    const result = await streamText({
      model: getModel(model),
      system: `${SYSTEM_PROMPT} Current date and time: ${currentDate}`,
      messages: messages,
      tools: getTools({
        uiStream,
        fullResponse
      }),
      maxSteps: 5,
      onStepFinish: async event => {
        if (event.stepType === 'initial') {
          if (event.toolCalls && event.toolCalls.length > 0) {
            uiStream.append(<AnswerSection result={streamableText.value} />)
            toolResults = event.toolResults
          } else {
            uiStream.update(<AnswerSection result={streamableText.value} />)
          }
        }
      }
    })

    for await (const delta of result.fullStream) {
      if (delta.type === 'text-delta' && delta.textDelta) {
        fullResponse += delta.textDelta
        streamableText.update(fullResponse)
      }
    }

    streamableText.done(fullResponse)

    return { text: fullResponse, toolResults }
  } catch (error) {
    console.error('Error in researcher:', error)
    return {
      text: 'An error has occurred. Please try again.',
      toolResults: []
    }
  }
}

export async function researcherWithOllama(
  uiStream: ReturnType<typeof createStreamableUI>,
  messages: CoreMessage[],
  model: string
) {
  try {
    const fullResponse = ''
    const streamableText = createStreamableValue<string>()
    let toolResults: any[] = []

    const currentDate = new Date().toLocaleString()
    const result = await generateText({
      model: getModel(model),
      system: `${SYSTEM_PROMPT} Current date and time: ${currentDate}`,
      messages: messages,
      tools: getTools({
        uiStream,
        fullResponse
      }),
      maxSteps: 5,
      onStepFinish: async event => {
        if (event.stepType === 'initial') {
          if (event.toolCalls) {
            uiStream.append(<AnswerSection result={streamableText.value} />)
            toolResults = event.toolResults
          } else {
            uiStream.update(<AnswerSection result={streamableText.value} />)
          }
        }
      }
    })

    streamableText.done(result.text)

    return { text: result.text, toolResults }
  } catch (error) {
    console.error('Error in researcherWithOllama:', error)
    return {
      text: 'An error has occurred. Please try again.',
      toolResults: []
    }
  }
}
