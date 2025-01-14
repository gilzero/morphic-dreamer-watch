/**
 * @fileoverview This file defines the Section component, which
 * renders a section with an optional title, icon, and separator.
 * @filepath components/section.tsx
 */
'use client'

import { cn } from '@/lib/utils'
import {
  BookCheck,
  Film,
  Image,
  MessageCircleMore,
  Newspaper,
  Repeat2,
  Search
} from 'lucide-react'
import React from 'react'
import { Separator } from './ui/separator'

/**
 * Defines the props for the Section component.
 */
type SectionProps = {
  /** The content of the section. */
  children: React.ReactNode
  /** Additional CSS class names for the section. */
  className?: string
  /** The size of the section (sm, md, or lg). */
  size?: 'sm' | 'md' | 'lg'
  /** The title of the section. */
  title?: string
  /** Whether to display a separator above the section. */
  separator?: boolean
}

/**
 * Renders a section with an optional title, icon, and separator.
 * @param {SectionProps} props - The props for the component.
 * @returns {JSX.Element} A section element.
 */
export const Section: React.FC<SectionProps> = ({
  children,
  className,
  size = 'md',
  title,
  separator = false
}) => {
  const iconSize = 16
  const iconClassName = 'mr-1.5 text-muted-foreground'
  let icon: React.ReactNode
  switch (title) {
    case 'Images':
      // eslint-disable-next-line jsx-a11y/alt-text
      icon = <Image size={iconSize} className={iconClassName} />
      break
    case 'Sources':
      icon = <Newspaper size={iconSize} className={iconClassName} />
      break
    case 'Answer':
      icon = <BookCheck size={iconSize} className={iconClassName} />
      break
    case 'Related':
      icon = <Repeat2 size={iconSize} className={iconClassName} />
      break
    case 'Follow-up':
      icon = <MessageCircleMore size={iconSize} className={iconClassName} />
      break
    default:
      icon = <Search size={iconSize} className={iconClassName} />
  }

  return (
    <>
      {separator && <Separator className="my-2 bg-primary/10" />}
      <section
        className={cn(
          ` ${size === 'sm' ? 'py-1' : size === 'lg' ? 'py-4' : 'py-2'}`,
          className
        )}
      >
        {title && (
          <h2 className="flex items-center leading-none py-2">
            {icon}
            {title}
          </h2>
        )}
        {children}
      </section>
    </>
  )
}
