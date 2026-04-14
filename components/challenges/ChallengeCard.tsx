import React from 'react';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import { formatGroupPlaceLine } from '../../constants/communityChallenges';
import { FEED_COHORT_META } from '../../constants/feedCohorts';
import { Icons } from '../Icons';
import { ChallengeDetailPanel } from './ChallengeDetailPanel';

function resolveTierIndexForCard(challenge: CommunityChallenge): number {
  const n = challenge.milestones.length;
  if (n === 0) return 0;
  if (challenge.currentTierIndex !== undefined) {
    return Math.min(Math.max(0, challenge.currentTierIndex), n - 1);
  }
  if (challenge.lifecycle === 'completed') return n - 1;
  return 0;
}

export interface ChallengeCardProps {
  challenge: CommunityChallenge;
  optedIn: boolean;
  onToggleOptIn: () => void;
  highFiveByMemberId?: Record<string, number>;
  onHighFive?: (memberId: string) => void;
  onOpenShareout?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  optedIn,
  onToggleOptIn,
  highFiveByMemberId,
  onHighFive,
  onOpenShareout,
}) => {
  const meta = FEED_COHORT_META[challenge.cohortId];
  const isCompleted = challenge.lifecycle === 'completed';
  const isUpcoming = challenge.lifecycle === 'upcoming';
  const tierIdx = resolveTierIndexForCard(challenge);
  /** Rankings and “your tier” do not apply before the challenge starts. */
  const showGroupPlacement = !isUpcoming;
  const highlightMyTier = showGroupPlacement && challenge.milestones.length > 0;

  const dateLine = isCompleted
    ? `Ended ${new Date(challenge.endsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    : challenge.lifecycle === 'upcoming'
      ? `Starts ${new Date(challenge.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      : challenge.daysLeft != null
        ? `${challenge.daysLeft} days left`
        : null;

  return (
    <div
      tabIndex={0}
      className="group rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] p-4 sm:p-5 shadow-[var(--cds-elevation-level1)] outline-none transition-shadow hover:shadow-[var(--cds-elevation-level2)] focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] focus-visible:ring-offset-2"
      aria-label={`${challenge.name}. Hover or focus to expand details.`}
    >
      {/* Summary — always visible */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--cds-color-blue-25)] px-2.5 py-0.5 cds-body-secondary text-[var(--cds-color-grey-975)]">
              {meta.pillLabel}
            </span>
            {isCompleted && challenge.outcome?.won && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cds-color-purple-25)] px-2.5 py-0.5 cds-body-secondary text-[var(--cds-color-purple-800)]">
                <Icons.Trophy className="h-3.5 w-3.5" aria-hidden />
                Group won
              </span>
            )}
          </div>
          <h3 className="cds-subtitle-md text-[var(--cds-color-grey-975)]">{challenge.name}</h3>
          {challenge.milestones.length === 0 && showGroupPlacement && (
            <p className="mt-1 cds-body-tertiary text-[var(--cds-color-grey-600)]">{formatGroupPlaceLine(challenge)}</p>
          )}
          {dateLine && (
            <p className="mt-2 text-base font-semibold uppercase tracking-wide text-[var(--cds-color-green-700)]">{dateLine}</p>
          )}
          <p className="mt-3 line-clamp-2 cds-body-secondary text-[var(--cds-color-grey-700)]">{challenge.whyJoin}</p>
        </div>

        {challenge.milestones.length > 0 && (
          <div
            className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:min-w-[min(100%,260px)] sm:max-w-[400px] sm:border-l sm:border-[var(--cds-color-grey-100)] sm:pl-6"
            aria-label={showGroupPlacement ? 'Group placement and challenge levels' : 'Challenge levels (preview)'}
          >
            {showGroupPlacement && (
              <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">{formatGroupPlaceLine(challenge)}</p>
            )}
            <p className="cds-body-secondary font-medium text-[var(--cds-color-grey-975)]">Levels</p>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end" role="list">
              {challenge.milestones.map((m, i) => {
                const isCurrent = highlightMyTier && i === tierIdx;
                return (
                  <div
                    key={m.id}
                    role="listitem"
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`flex min-w-[5.25rem] flex-1 flex-col items-center rounded-[var(--cds-border-radius-100)] border px-2 py-2 text-center transition-shadow ${
                      isCurrent
                        ? 'border-[var(--cds-color-blue-700)] bg-[var(--cds-color-blue-25)] shadow-[var(--cds-elevation-level1)] ring-2 ring-[var(--cds-color-blue-700)]/25'
                        : 'border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)]'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isCurrent
                          ? 'bg-[var(--cds-color-blue-700)] text-[var(--cds-color-white)]'
                          : 'bg-[var(--cds-color-blue-25)] text-[var(--cds-color-blue-800)]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="mt-1.5 line-clamp-2 cds-body-secondary font-medium text-[var(--cds-color-grey-975)]">{m.label}</span>
                    {m.target && (
                      <span className="mt-0.5 line-clamp-2 cds-body-tertiary text-[var(--cds-color-grey-600)]">{m.target}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Full details on hover or keyboard focus-within */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
        <div className="min-h-0 overflow-hidden">
          <div className="pointer-events-auto mt-4 max-h-[min(70vh,560px)] overflow-y-auto border-t border-[var(--cds-color-grey-100)] pt-4">
            <ChallengeDetailPanel
              challenge={challenge}
              optedIn={optedIn}
              onToggleOptIn={onToggleOptIn}
              highFiveByMemberId={highFiveByMemberId}
              onHighFive={onHighFive}
              onOpenShareout={onOpenShareout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
