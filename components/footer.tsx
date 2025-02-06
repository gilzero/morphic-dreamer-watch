/**
 * @fileoverview This file defines the Footer component, which
 * displays social media links and a link to the main site.
 * It uses icons and buttons for a clean UI.
 * @filepath components/footer.tsx
 */
import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiGithub, SiX } from 'react-icons/si'
import { Button } from './ui/button'
import { PiBirdFill } from 'react-icons/pi'

/**
 * Footer component.
 *
 * Renders a footer with social media links and a link to the
 * main site.
 *
 * @returns {JSX.Element} The rendered Footer component.
 */
const Footer: React.FC = () => {
  return (
    <footer className="w-fit p-1 md:p-2 fixed bottom-0 right-0">
      <div className="flex justify-end">
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://www.dreamer.xyz" target="_blank">
            <PiBirdFill size={18} className="animate-spin-custom" />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://weiming.ai" target="_blank">
            <span className="text-lg font-bold">W</span>
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://x.com/gilzero" target="_blank">
            <SiX size={18} />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://git.new/gilzero" target="_blank">
            <SiGithub size={18} />
          </Link>
        </Button>
      </div>
    </footer>
  )
}

export default Footer
