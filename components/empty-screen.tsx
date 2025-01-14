/**
 * @fileoverview This file defines the EmptyScreen component, which displays
 * a set of example messages as buttons. It is used when no messages are
 * available.
 * @filepath components/empty-screen.tsx
 */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

/**
 * An array of example messages, each with a heading and a message.
 */
const allMessages = [
  {
    heading: '🚀 What watches have been worn in space exploration?',
    message: 'What watches have been worn in space exploration? From the Omega Speedmaster to modern Mars mission timepieces'
  },
  {
    heading: '🎨 Rise of Independent Watchmakers?',
    message: 'Explore the growing influence of independent watchmakers like F.P. Journe, MB&F, and H. Moser. What makes their approach unique?'
  },
  {
    heading: '🌊 Dive Watch Evolution',
    message: 'How have dive watches evolved from the Blancpain Fifty Fathoms to modern professional diving instruments?'
  },
  {
    heading: '⌚️ Smart vs Mechanical Luxury',
    message: 'How are traditional luxury watchmakers responding to smartwatches? Analyze hybrid approaches and market adaptation'
  },
  {
    heading: '👨‍🎨 Who are legendary Watch Designers',
    message: 'Who are the most influential watch designers in history? From Gerald Genta to modern visionaries'
  },
  {
    heading: '🎯 Art of Guilloche?',
    message: 'Explain the traditional craft of guilloche dial-making and its role in modern luxury watchmaking'
  },
  {
    heading: '🪖 What makes a military watch?',
    message: 'What makes a military watch? Analyze historical specifications and modern interpretations'
  },
  {
    heading: '🎯 Chronometer Certification',
    message: 'What does COSC certification mean? Compare different chronometer standards and their significance'
  },
  {
    heading: '🏎️ Racing Chronographs?',
    message: 'Explore the connection between automotive racing and chronograph watches, from Heuer to modern racing partnerships'
  },
  {
    heading: '📈 Watch Investment Bubbles?',
    message: 'Analyze historical watch market bubbles and crashes. What lessons can collectors learn?'
  },
  {
    heading: '👑 Patek vs Lange?',
    message: 'Compare A. Lange & Söhne and Patek Philippe - their philosophies, finishing standards, and value proposition'
  },
  {
    heading: '🗾 Japanese Watchmaking?',
    message: 'How do Japanese luxury watches from Grand Seiko and Credor compare to Swiss counterparts in terms of craftsmanship?'
  },
  {
    heading: '📅 How do perpetual calendar mechanisms work?',
    message: 'How do perpetual calendar mechanisms work? Explain the engineering behind these complex complications'
  },
  {
    heading: '☄️ What are meteorite dials?',
    message: 'What are meteorite dials? Explain their formation, rarity, and use in luxury watches'
  },
  {
    heading: '🔨 Watch Auction Psychology?',
    message: 'What drives record-breaking prices at watch auctions? Analyze collector psychology and market dynamics'
  },
  {
    heading: '🌊 Resonance in Watches?',
    message: 'Explain the principle of resonance in watchmaking and its implementation by brands like Armin Strom and F.P. Journe'
  },
  {
    heading: '🏛️ Heritage vs Innovation?',
    message: 'How do luxury watch brands balance traditional craftsmanship with modern innovation? Case studies of successful approaches'
  },
  {
    heading: '🔔 What makes a great minute repeater?',
    message: 'What makes a great minute repeater? Compare different approaches to this acoustic complication'
  },
  {
    heading: '🧠 Watch Collecting Psychology?',
    message: 'Analyze the psychology behind watch collecting - from acquisition patterns to emotional attachment'
  },
  {
    heading: '🔮 Innovations and trends of future of Watchmaking?',
    message: 'What innovations and trends will shape luxury watchmaking in the next decade? From materials to complications'
  }
]

/**
 * Returns a specified number of random messages from the given array.
 *
 * @param {typeof allMessages} messages - The array of messages to select from.
 * @param {number} count - The number of random messages to return.
 * @returns {typeof allMessages} An array containing the specified number of
 * random messages.
 */
function getRandomMessages(messages: typeof allMessages, count: number) {
  const shuffled = [...messages].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * EmptyScreen component displays a set of example messages as buttons.
 *
 * @param {Object} props - The component props.
 * @param {function} props.submitMessage - Function to submit a message.
 * @param {string} [props.className] - Optional CSS class name.
 * @returns {JSX.Element|null} The EmptyScreen component or null if no messages.
 */
export function EmptyScreen({
                              submitMessage,
                              className
                            }: {
  submitMessage: (message: string) => void
  className?: string
}) {
  const [exampleMessages, setExampleMessages] = useState<typeof allMessages>([])

  useEffect(() => {
    setExampleMessages(getRandomMessages(allMessages, 5))
  }, [])

  if (exampleMessages.length === 0) return null

  return (
      <div className={`mx-auto w-full transition-all ${className}`}>
        <div className="bg-background p-2">
          <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
            {exampleMessages.map((message, index) => (
                <Button
                    key={index}
                    variant="link"
                    className="h-auto p-0 text-base"
                    name={message.message}
                    onClick={async () => {
                      submitMessage(message.message)
                    }}
                >
                  <ArrowRight size={16} className="mr-2 text-muted-foreground" />
                  {message.heading}
                </Button>
            ))}
          </div>
        </div>
      </div>
  )
}
