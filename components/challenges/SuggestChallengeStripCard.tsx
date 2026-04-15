import React from 'react';
import type { FeedCohortId } from '../../constants/feedCohorts';
import { FEED_COHORT_META } from '../../constants/feedCohorts';

export interface SuggestChallengeStripCardProps {
  cohortId: FeedCohortId;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Slim strip for cohorts with no upcoming challenge — dashed outline, no hero graphic
 * (aligned with the old “suggest a challenge” empty state).
 */
export const SuggestChallengeStripCard: React.FC<SuggestChallengeStripCardProps> = ({
  cohortId,
  isSelected,
  onSelect,
}) => {
  const meta = FEED_COHORT_META[cohortId];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-[100px] w-[7.5rem] shrink-0 snap-start flex-col justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed px-2 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)] ${
        isSelected
          ? 'border-[var(--cds-color-blue-700)] bg-[var(--cds-color-blue-25)] ring-2 ring-[var(--cds-color-blue-700)]/25'
          : 'border-[var(--cds-color-grey-200)] bg-transparent hover:border-[var(--cds-color-grey-300)] hover:bg-[var(--cds-color-grey-25)]'
      }`}
      aria-pressed={isSelected}
      aria-label={`Suggest a challenge for ${meta.label}. Show details below.`}
    >
      <span className="w-fit rounded-full border border-dashed border-[var(--cds-color-blue-300)] bg-[var(--cds-color-white)] px-1.5 py-px text-[8px] font-bold uppercase leading-none text-[var(--cds-color-blue-800)]">
        Suggest
      </span>
      <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-[var(--cds-color-grey-975)]">Add a challenge</p>
      <p className="truncate text-[9px] leading-tight text-[var(--cds-color-grey-600)]">{meta.pillLabel}</p>
    </button>
  );
};
