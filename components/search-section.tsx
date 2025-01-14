/**
 * @fileoverview This file defines the SearchSection component,
 * which displays search results, including images and sources.
 * @filepath components/search-section.tsx
 */
'use client'

import { SearchResults } from './search-results'
import { DefaultSkeleton } from './default-skeleton'
import { SearchResultsImageSection } from './search-results-image'
import { Section } from './section'
import { ToolBadge } from './tool-badge'
import type { SearchResults as TypeSearchResults } from '@/lib/types'
import { StreamableValue, useStreamableValue } from 'ai/rsc'

/**
 * Defines the props for the SearchSection component.
 */
export type SearchSectionProps = {
  /** A streamable value containing the search results. */
  result?: StreamableValue<string>
  /** An array of domains to include in the search. */
  includeDomains?: string[]
}

/**
 * Renders a section displaying search results, including
 * images and sources.
 * @param {SearchSectionProps} props - The props for the
 * component.
 * @returns {JSX.Element} A div containing the search results
 * section.
 */
export function SearchSection({ result, includeDomains }:
  SearchSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const searchResults: TypeSearchResults = data ?
    JSON.parse(data) : undefined
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''
  return (
    <div>
      {!pending && data ? (
        <>
          <Section size="sm" className="pt-2 pb-0">
            <ToolBadge tool="search">{`${searchResults.query}${includeDomainsString}`}</ToolBadge>
          </Section>
          {searchResults.images && searchResults.images.length > 0 && (
            <Section title="Images">
              <SearchResultsImageSection
                images={searchResults.images}
                query={searchResults.query}
              />
            </Section>
          )}
          <Section title="Sources">
            <SearchResults results={searchResults.results} />
          </Section>
        </>
      ) : (
        <DefaultSkeleton />
      )}
    </div>
  )
}
