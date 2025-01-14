/**
 * @fileoverview This file defines the RetrieveSection component, which
 * renders a section displaying search results.
 * @filepath components/retrieve-section.tsx
 */
import React from 'react';
import { Section } from '@/components/section';
import { SearchResults } from '@/components/search-results';
import { SearchResults as SearchResultsType } from '@/lib/types';

/**
 * Defines the props for the RetrieveSection component.
 */
interface RetrieveSectionProps {
  /**
   * The search results data to display.
   */
  data: SearchResultsType;
}

/**
 * Renders a section displaying search results.
 * @param {RetrieveSectionProps} props - The props for the component.
 * @returns {JSX.Element} A section containing the search results.
 */
const RetrieveSection: React.FC<RetrieveSectionProps> = ({ data }) => {
  return (
    <Section title="Sources">
      <SearchResults results={data.results} />
    </Section>
  );
};

export default RetrieveSection;
