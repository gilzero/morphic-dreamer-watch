import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

/*
const exampleMessages = [
  {
    heading: 'What is OpenAI o1?',
    message: 'What is OpenAI o1?'
  },
  {
    heading: 'Why is Nvidia growing rapidly?',
    message: 'Why is Nvidia growing rapidly?'
  },
  {
    heading: 'Tesla vs Rivian',
    message: 'Tesla vs Rivian'
  },
  {
    heading: 'Summary: https://arxiv.org/pdf/2407.16833',
    message: 'Summary: https://arxiv.org/pdf/2407.16833'
  }
]
*/

const exampleMessages = [
  {
    heading: 'Rolex Submariner vs Omega Seamaster',
    message: 'Compare the features, heritage, and value proposition of the Rolex Submariner and Omega Seamaster dive watches'
  },
  {
    heading: 'Watch Investment Guide 2024',
    message: 'What are the best luxury watches to invest in for 2024? Consider factors like brand heritage, market demand, and historical appreciation'
  },
  {
    heading: 'Understanding Watch Complications',
    message: 'Explain the main watch complications (chronograph, perpetual calendar, tourbillon) and their significance in horology'
  },
  {
    heading: 'Vintage Watch Authentication',
    message: 'What are the key factors to consider when authenticating vintage luxury watches? Focus on movement, dial, case, and documentation'
  },
  {
    heading: 'Summary: https://www.globenewswire.com/.../Global-Watch-Market-Report-2024-2032-with-Focus-on-China.html',
    message: 'Summary: https://www.globenewswire.com/news-release/2024/08/14/2930293/28124/en/Global-Watch-Market-Report-2024-2032-with-Focus-on-China.html'
  }
]

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
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
