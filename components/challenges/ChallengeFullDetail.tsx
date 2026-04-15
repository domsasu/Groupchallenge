import React from 'react';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import { formatChallengeCardHeroLabel, formatGroupPlaceLine } from '../../constants/communityChallenges';
import {
  CHALLENGE_TIER_DISPLAY_NAME,
  CHALLENGE_TIER_PROGRESS_TONE,
} from '../../constants/challengeTierVisuals';
import type { FeedCohortId } from '../../constants/feedCohorts';
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

const HERO_GRADIENT: Partial<Record<FeedCohortId, string>> = {
  careerswitchers: 'from-slate-950 via-blue-950 to-sky-600',
  enrolled: 'from-violet-950 via-purple-900 to-fuchsia-600',
  ai: 'from-zinc-950 via-emerald-950 to-teal-500',
  design: 'from-rose-950 via-orange-900 to-amber-500',
};
const HERO_FALLBACK = 'from-slate-800 via-slate-700 to-slate-600';

function heroClass(cohortId: FeedCohortId): string {
  return HERO_GRADIENT[cohortId] ?? HERO_FALLBACK;
}

export interface ChallengeFullDetailProps {
  challenge: CommunityChallenge;
  optedIn: boolean;
  onToggleOptIn: () => void;
  highFiveByMemberId?: Record<string, number>;
  onHighFive?: (memberId: string) => void;
  onOpenShareout?: () => void;
}

/**
 * Full challenge summary + actionable panel for the bottom detail region on Community → Challenges.
 */
export const ChallengeFullDetail: React.FC<ChallengeFullDetailProps> = ({
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
  const showGroupPlacement = !isUpcoming;

  const lifecyclePillClass =
    challenge.lifecycle === 'active'
      ? 'bg-emerald-500/90 text-white'
      : challenge.lifecycle === 'upcoming'
        ? 'bg-amber-500/90 text-white'
        : 'bg-white/20 text-white backdrop-blur-sm';

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] shadow-[var(--cds-elevation-level1)]">
      <div className={`relative bg-gradient-to-br ${heroClass(challenge.cohortId)} px-4 pb-4 pt-4`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" aria-hidden />
        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span
              className={`line-clamp-2 max-w-[min(100%,11rem)] rounded-md px-1.5 py-0.5 text-[9px] font-semibold leading-tight ${lifecyclePillClass}`}
            >
              {formatChallengeCardHeroLabel(challenge)}
            </span>
            {isCompleted && challenge.outcome?.won && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                <Icons.Trophy className="h-3 w-3" aria-hidden />
                Group won
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold leading-snug text-white drop-shadow-sm sm:text-xl">{challenge.name}</h2>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="shrink-0 rounded-full bg-[var(--cds-color-blue-25)] px-2.5 py-0.5 cds-body-secondary text-[var(--cds-color-grey-975)]">
            {meta.pillLabel}
          </span>
          {showGroupPlacement && (
            <p className="cds-body-tertiary min-w-0 flex-1 text-[var(--cds-color-grey-600)] sm:text-right">
              {formatGroupPlaceLine(challenge)}
            </p>
          )}
        </div>
        <p className="cds-body-secondary text-[var(--cds-color-grey-700)]">{challenge.whyJoin}</p>

        {challenge.milestones.length > 0 && (
          <div
            aria-label={showGroupPlacement ? 'Challenge progress' : 'Challenge progress (preview)'}
            className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] p-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="cds-body-secondary font-semibold text-[var(--cds-color-grey-975)]">Progress to goal</p>
                <p className="mt-0.5 text-xs text-[var(--cds-color-grey-600)]">
                  Visual tier: {CHALLENGE_TIER_DISPLAY_NAME[challenge.visualTier]}
                </p>
              </div>
              <span className="text-lg font-bold tabular-nums text-[var(--cds-color-grey-975)]">
                {Math.round(Math.min(1, Math.max(0, challenge.cardProgress)) * 100)}%
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--cds-color-grey-200)]">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${CHALLENGE_TIER_PROGRESS_TONE[challenge.visualTier]}`}
                style={{
                  width: `${Math.round(Math.min(1, Math.max(0, challenge.cardProgress)) * 100)}%`,
                }}
              />
            </div>

            <p className="mt-3 text-sm text-[var(--cds-color-grey-700)]">
              <span className="font-medium text-[var(--cds-color-grey-975)]">Now:</span>{' '}
              {challenge.milestones[tierIdx]?.label ?? '—'}
              {challenge.milestones[tierIdx]?.target ? ` · ${challenge.milestones[tierIdx].target}` : null}
              {tierIdx < challenge.milestones.length - 1 && challenge.milestones[tierIdx + 1]?.label ? (
                <>
                  {' '}
                  <span className="text-[var(--cds-color-grey-500)]">→</span> Next:{' '}
                  <span className="font-medium text-[var(--cds-color-grey-975)]">
                    {challenge.milestones[tierIdx + 1].label}
                  </span>
                  {challenge.milestones[tierIdx + 1].target
                    ? ` (${challenge.milestones[tierIdx + 1].target})`
                    : null}
                </>
              ) : null}
            </p>

            <div className="mt-5" role="list">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--cds-color-grey-500)]">Milestones</p>
              <div className="flex items-start gap-0">
                {challenge.milestones.map((m, i) => {
                  const stepDone = isCompleted ? i <= tierIdx : i < tierIdx;
                  const current = !isCompleted && i === tierIdx;
                  const upcoming = !isCompleted && i > tierIdx;
                  return (
                    <React.Fragment key={m.id}>
                      {i > 0 && (
                        <div
                          className="mx-0.5 mt-3 h-0.5 min-w-0 flex-1 rounded-full bg-[var(--cds-color-grey-200)]"
                          aria-hidden
                        >
                          <div
                            className={`h-full rounded-full ${tierIdx > i - 1 ? CHALLENGE_TIER_PROGRESS_TONE[challenge.visualTier] : 'bg-transparent'}`}
                            style={{ width: tierIdx > i - 1 ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                      <div
                        role="listitem"
                        aria-current={current ? 'step' : undefined}
                        className="flex max-w-[7rem] min-w-0 flex-1 flex-col items-center text-center"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            stepDone
                              ? 'bg-[var(--cds-color-blue-700)] text-white'
                              : current
                                ? 'bg-[var(--cds-color-white)] ring-2 ring-[var(--cds-color-blue-700)] ring-offset-2 ring-offset-[var(--cds-color-grey-25)] text-[var(--cds-color-blue-800)]'
                                : 'bg-[var(--cds-color-grey-200)] text-[var(--cds-color-grey-500)]'
                          }`}
                        >
                          {stepDone ? '✓' : i + 1}
                        </span>
                        <span
                          className={`mt-2 line-clamp-2 text-[11px] font-semibold leading-tight ${
                            upcoming ? 'text-[var(--cds-color-grey-500)]' : 'text-[var(--cds-color-grey-975)]'
                          }`}
                        >
                          {m.label}
                        </span>
                        {m.target && (
                          <span className="mt-0.5 line-clamp-2 text-[10px] text-[var(--cds-color-grey-600)]">{m.target}</span>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="border-t border-[var(--cds-color-grey-100)] px-4 pb-5 pt-4 sm:px-5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
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
  );
};
