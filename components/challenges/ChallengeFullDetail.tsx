import React from 'react';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import {
  formatChallengeCardHeroLabel,
  formatProgressGoalQuantityLine,
  formatProgressGoalQuantityLineForFraction,
  getGroupProgressTowardGoal,
  resolveGroupsAtTierColumns,
} from '../../constants/communityChallenges';
import {
  CHALLENGE_TIER_DISPLAY_NAME,
  CHALLENGE_TIER_PROGRESS_TONE,
} from '../../constants/challengeTierVisuals';
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

/** Fill % for the connector between milestone segmentIndex and segmentIndex+1 (0-based), from overall card progress. */
function connectorSegmentFillPercent(segmentIndex: number, gapCount: number, cardProgress: number): number {
  if (gapCount <= 0) return 0;
  const p = Math.min(1, Math.max(0, cardProgress));
  const pos = p * gapCount;
  if (pos >= segmentIndex + 1) return 100;
  if (pos <= segmentIndex) return 0;
  return (pos - segmentIndex) * 100;
}

export interface ChallengeFullDetailProps {
  challenge: CommunityChallenge;
  optedIn: boolean;
  onToggleOptIn: () => void;
  highFiveByMemberId?: Record<string, number>;
  onHighFive?: (memberId: string) => void;
  onOpenShareout?: () => void;
  /** Shown under “Your contribution” (prototype learner name). */
  learnerDisplayName?: string;
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
  learnerDisplayName = 'Priya',
}) => {
  const meta = FEED_COHORT_META[challenge.cohortId];
  const isCompleted = challenge.lifecycle === 'completed';
  const isUpcoming = challenge.lifecycle === 'upcoming';
  const tierIdx = resolveTierIndexForCard(challenge);
  const showGroupPlacement = !isUpcoming;
  const progressGoalLine = formatProgressGoalQuantityLine(challenge);
  const progressFallbackPct = `${Math.round(Math.min(1, Math.max(0, challenge.cardProgress)) * 100)}%`;
  const tierGroupsLayout = resolveGroupsAtTierColumns(challenge) ?? challenge.groupsAtMilestoneTier;
  const learnerPoints =
    challenge.members?.find((m) => m.isCurrentUser)?.contribution ?? null;
  const tierReachedLabel = CHALLENGE_TIER_DISPLAY_NAME[challenge.visualTier];

  const lifecyclePillClass =
    challenge.lifecycle === 'active'
      ? 'bg-emerald-500/90 text-white'
      : challenge.lifecycle === 'upcoming'
        ? 'bg-amber-500/90 text-white'
        : 'bg-white/20 text-white backdrop-blur-sm';

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] shadow-[var(--cds-elevation-level1)]">
      <div className="relative bg-[#141518] px-4 pb-4 pt-4">
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#141518] via-[#141518]/80 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-start gap-2">
            <span
              className={`line-clamp-2 max-w-[min(100%,14rem)] rounded-lg px-2.5 py-1 text-xs font-semibold leading-snug ${lifecyclePillClass}`}
            >
              {formatChallengeCardHeroLabel(challenge)}
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-snug text-white drop-shadow-sm sm:text-xl">{challenge.name}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-white/85 drop-shadow-sm">{challenge.whyJoin}</p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {isCompleted && (
          <div className="overflow-hidden rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] bg-[#F0F9F4] px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8">
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
                <div>
                  <p className="text-xl font-bold leading-tight tracking-tight text-[var(--cds-color-grey-975)] sm:text-2xl">
                    Challenge complete!
                  </p>
                  <p className="mt-1 text-xl font-bold leading-tight tracking-tight text-[var(--cds-color-grey-975)] sm:text-2xl">
                    Great job Group {challenge.groupIndex}!
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="cds-body-secondary text-[var(--cds-color-grey-975)]">
                    Tier reached{' '}
                    <span className="font-semibold text-[var(--cds-color-grey-800)]">{tierReachedLabel}</span>
                  </p>
                  {learnerPoints != null && (
                    <p className="cds-body-secondary text-[var(--cds-color-grey-975)]">
                      Points earned{' '}
                      <span className="font-semibold text-teal-600">
                        {learnerPoints.toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
                {onOpenShareout ? (
                  <button
                    type="button"
                    onClick={onOpenShareout}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-blue-700)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--cds-color-blue-800)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]"
                  >
                    <Icons.Share className="h-4 w-4 shrink-0 text-white" aria-hidden />
                    Share
                  </button>
                ) : null}
              </div>
              <div className="relative mx-auto min-h-[180px] w-full max-w-md shrink-0 overflow-hidden sm:mx-0 sm:min-h-0 sm:max-w-[360px] sm:flex-1 sm:self-stretch">
                <img
                  src="/challenges/completed-celebration-banner.png"
                  alt=""
                  className="h-full min-h-[180px] w-full object-cover object-right sm:min-h-full"
                  decoding="async"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex w-full flex-wrap items-center gap-2">
          <span className="shrink-0 text-lg font-semibold leading-snug text-[var(--cds-color-grey-975)] sm:text-xl">
            {meta.pillLabel}
          </span>
          {showGroupPlacement && (
            <span className="w-fit shrink-0 rounded-full border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-grey-25)] px-2.5 py-0.5 cds-body-secondary text-[var(--cds-color-grey-975)]">
              Group {challenge.groupIndex}
            </span>
          )}
        </div>

        {challenge.milestones.length > 0 && isUpcoming && (
          <div className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] p-4">
            <p className="cds-body-secondary font-semibold text-[var(--cds-color-grey-975)]">Milestones</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--cds-color-grey-700)]">
              {challenge.milestones.map((m) => (
                <li key={m.id} className="cds-body-secondary marker:text-[var(--cds-color-grey-400)]">
                  <span className="font-medium text-[var(--cds-color-grey-975)]">{m.label}</span>
                  {m.target ? <span className="text-[var(--cds-color-grey-600)]"> · {m.target}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {challenge.milestones.length > 0 && !isUpcoming && !isCompleted && (
          <div
            aria-label={showGroupPlacement ? 'Challenge progress' : 'Challenge progress (preview)'}
            className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] p-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="cds-body-secondary font-semibold text-[var(--cds-color-grey-975)]">Progress to goal</p>
              <span className="text-lg font-bold tabular-nums text-[var(--cds-color-grey-975)]">
                {progressGoalLine ?? progressFallbackPct}
              </span>
            </div>

            <div className="mt-5" role="list">
              <div className="flex items-start gap-0">
                {challenge.milestones.map((m, i) => {
                  const isHeadStep = i === tierIdx;
                  const upcoming = !isCompleted && i > tierIdx;
                  const showGroupsByTier = tierGroupsLayout != null;
                  const raw = tierGroupsLayout?.[i];
                  const groups = raw != null ? [...raw].sort((a, b) => a - b) : [];
                  const gapCount = Math.max(0, challenge.milestones.length - 1);
                  const segmentFillPct =
                    i > 0 ? connectorSegmentFillPercent(i - 1, gapCount, challenge.cardProgress) : 0;
                  return (
                    <React.Fragment key={m.id}>
                      {i > 0 && (
                        <div
                          className="relative z-0 flex h-8 min-w-0 flex-1 items-center"
                          aria-hidden
                        >
                          <div className="absolute left-[-0.75rem] right-[-0.75rem] top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--cds-color-grey-200)]">
                            <div
                              className={`h-full rounded-full ${segmentFillPct > 0 ? CHALLENGE_TIER_PROGRESS_TONE[challenge.visualTier] : 'bg-transparent'}`}
                              style={{ width: `${segmentFillPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div
                        role="listitem"
                        aria-current={isHeadStep ? 'step' : undefined}
                        className="relative z-[1] flex max-w-[7rem] min-w-0 flex-1 flex-col items-center text-center"
                      >
                        <span
                          className={`relative z-[2] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--cds-color-grey-25)] ${
                            isHeadStep
                              ? 'bg-[#E5C158] text-[var(--cds-color-grey-975)]'
                              : 'bg-[var(--cds-color-grey-200)] text-[var(--cds-color-grey-500)]'
                          }`}
                          aria-label={m.label}
                        >
                          <Icons.Trophy className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.25} />
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
                        {showGroupsByTier && (
                          <div
                            className="mt-3 flex w-full flex-col items-center"
                            aria-label={`Groups at ${m.label}`}
                          >
                            <div
                              className="h-8 w-px shrink-0 bg-[var(--cds-color-grey-200)]"
                              aria-hidden
                            />
                            <div
                              className="mt-2 flex flex-col items-center gap-1.5"
                              role={groups.length > 0 ? 'list' : undefined}
                            >
                              {groups.length > 0 ? (
                                groups.map((g) => {
                                  const isLearnerGroup = g === challenge.groupIndex;
                                  const progress01 = getGroupProgressTowardGoal(challenge, g, i);
                                  const progressLine =
                                    formatProgressGoalQuantityLineForFraction(challenge, progress01) ??
                                    `${Math.round(progress01 * 100)}%`;
                                  const tipId = `challenge-${challenge.id}-group-${g}-progress`;
                                  return (
                                    <div
                                      key={g}
                                      role="listitem"
                                      className="group relative inline-flex flex-col items-center"
                                    >
                                      <span
                                        tabIndex={0}
                                        aria-describedby={tipId}
                                        title={`Group ${g} · ${progressLine}`}
                                        className={`flex h-7 w-7 shrink-0 cursor-default items-center justify-center rounded-full border text-[11px] font-bold tabular-nums leading-none outline-none transition-[box-shadow,transform] hover:scale-105 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cds-color-grey-25)] ${
                                          isLearnerGroup
                                            ? 'border-[var(--cds-color-blue-500)] bg-[var(--cds-color-blue-25)] text-[var(--cds-color-grey-975)]'
                                            : 'border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] text-[var(--cds-color-grey-800)]'
                                        }`}
                                      >
                                        {g}
                                      </span>
                                      <div
                                        id={tipId}
                                        role="tooltip"
                                        className="pointer-events-none invisible absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md bg-[var(--cds-color-grey-975)] px-2.5 py-2 text-left opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-focus-within:visible group-hover:opacity-100 group-focus-within:opacity-100"
                                      >
                                        <span className="block text-[10px] font-semibold text-white">Group {g}</span>
                                        <span className="mt-0.5 block text-[10px] leading-snug text-white/90">
                                          Progress toward goal: {progressLine}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <span
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--cds-color-grey-200)] text-[10px] text-[var(--cds-color-grey-400)]"
                                  aria-label="No group at this tier"
                                >
                                  —
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {challenge.milestones.length > 0 &&
          !isUpcoming &&
          !isCompleted &&
          challenge.learnerContributionProgress != null && (
            <div className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] p-4">
              <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Your contribution</h4>
              <p className="mt-1 cds-body-secondary font-semibold text-[var(--cds-color-grey-975)]">
                {learnerDisplayName}
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center justify-between gap-3 rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="cds-body-secondary font-bold text-[var(--cds-color-grey-975)]">You</p>
                    <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">
                      {formatProgressGoalQuantityLineForFraction(
                        challenge,
                        challenge.learnerContributionProgress
                      ) ?? `${Math.round(challenge.learnerContributionProgress * 100)}%`}{' '}
                      toward the group goal
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--cds-color-grey-600)] sm:text-[11px]"
                    title="Preview: mock leaderboard badge"
                  >
                    Top 5 contributors
                  </span>
                </li>
              </ul>
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
