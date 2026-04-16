import React, { useEffect, useState } from 'react';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import {
  connectorSegmentFillPercentForModules,
  formatChallengeCardHeroLabel,
  formatProgressGoalQuantityLine,
  formatProgressGoalQuantityLineForFraction,
  getGroupProgressTowardGoal,
  parseChallengeGoalTotalUnits,
  parseMilestoneNumericCaps,
  resolveGroupsAtTierColumns,
  tierColumnIndexForCompletedUnits,
} from '../../constants/communityChallenges';
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

/** First number in milestone `target` (e.g. "25 modules" → "25"); otherwise 1-based step index. */
function milestoneQuantityLabel(m: { target?: string }, index: number): string {
  const match = m.target?.trim().match(/(\d+)/);
  if (match) return match[1];
  return String(index + 1);
}

/**
 * Resolver buckets are 0..n-1 by completed units (bucket 0 = before first cap). Milestone **circles**
 * show those caps (25, 50, …). Shift by one so pills sit under the matching outlined count (see design ref).
 */
function groupIdsAndTierIndexForMilestoneColumn(
  layout: number[][] | undefined,
  milestoneIndex: number
): { groupIds: number[]; tierIndexForResolver: number } {
  if (!layout?.length) return { groupIds: [], tierIndexForResolver: milestoneIndex };
  const tier = milestoneIndex + 1;
  if (tier >= layout.length) return { groupIds: [], tierIndexForResolver: milestoneIndex };
  return { groupIds: layout[tier] ?? [], tierIndexForResolver: tier };
}

/** 1-based group index → colored squad name (prototype: five teams). */
function groupSquadForIndex(g: number): {
  label: string;
  muted: string;
  active: string;
} {
  const squads: Record<number, { label: string; muted: string; active: string }> = {
    1: {
      label: 'Red Apes',
      muted: 'border-red-200 bg-red-50 text-red-950',
      active: 'border-red-500 bg-red-100 text-red-950 shadow-sm ring-2 ring-red-400/40',
    },
    2: {
      label: 'Blue Herons',
      muted: 'border-sky-200 bg-sky-50 text-sky-950',
      active: 'border-sky-500 bg-sky-100 text-sky-950 shadow-sm ring-2 ring-sky-400/40',
    },
    3: {
      label: 'Amber Foxes',
      muted: 'border-amber-200 bg-amber-50 text-amber-950',
      active: 'border-amber-500 bg-amber-100 text-amber-950 shadow-sm ring-2 ring-amber-400/40',
    },
    4: {
      label: 'Emerald Otters',
      muted: 'border-emerald-200 bg-emerald-50 text-emerald-950',
      active: 'border-emerald-500 bg-emerald-100 text-emerald-950 shadow-sm ring-2 ring-emerald-400/40',
    },
    5: {
      label: 'Violet Pandas',
      muted: 'border-violet-200 bg-violet-50 text-violet-950',
      active: 'border-violet-500 bg-violet-100 text-violet-950 shadow-sm ring-2 ring-violet-400/40',
    },
    6: {
      label: 'Copper Monsteras',
      muted: 'border-rose-300 bg-rose-50 text-rose-950',
      active: 'border-rose-500 bg-rose-100 text-rose-950 shadow-sm ring-2 ring-rose-400/40',
    },
  };
  return (
    squads[g] ?? {
      label: `Group ${g}`,
      muted:
        'border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] text-[var(--cds-color-grey-800)]',
      active:
        'border-[var(--cds-color-blue-500)] bg-[var(--cds-color-blue-25)] text-[var(--cds-color-grey-975)] shadow-sm ring-2 ring-[var(--cds-color-blue-400)]/35',
    }
  );
}

function TierSquadStack({
  challenge,
  milestoneLabel,
  milestoneIndex,
  groupIds,
}: {
  challenge: CommunityChallenge;
  milestoneLabel: string;
  milestoneIndex: number;
  groupIds: number[];
}) {
  const groups = [...groupIds].sort((a, b) => a - b);
  return (
    <div className="mt-0 flex w-full flex-col items-center" aria-label={`Groups at ${milestoneLabel}`}>
      <div className="h-8 w-px shrink-0 bg-[var(--cds-color-grey-200)]" aria-hidden />
      <div
        className="mt-2 flex flex-col items-center gap-1.5"
        role={groups.length > 0 ? 'list' : undefined}
      >
        {groups.length > 0 ? (
          groups.map((g) => {
            const isLearnerGroup = g === challenge.groupIndex;
            const squad = groupSquadForIndex(g);
            const progress01 = getGroupProgressTowardGoal(challenge, g, milestoneIndex);
            const progressLine =
              formatProgressGoalQuantityLineForFraction(challenge, progress01) ??
              `${Math.round(progress01 * 100)}%`;
            const tipId = `challenge-${challenge.id}-group-${g}-tier-${milestoneIndex}-progress`;
            return (
              <div key={g} role="listitem" className="group relative inline-flex flex-col items-center">
                <span
                  tabIndex={0}
                  aria-describedby={tipId}
                  title={`${squad.label} · ${progressLine}`}
                  aria-label={`${squad.label}, progress ${progressLine}`}
                  className={`inline-flex max-w-[6rem] min-h-[28px] shrink-0 cursor-default items-center justify-center rounded-full border px-2 py-1 text-center text-[9px] font-bold leading-tight outline-none transition-[box-shadow,transform] hover:scale-[1.02] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cds-color-grey-25)] ${
                    isLearnerGroup ? squad.active : squad.muted
                  }`}
                >
                  {squad.label}
                </span>
                <div
                  id={tipId}
                  role="tooltip"
                  className="pointer-events-none invisible absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md bg-[var(--cds-color-grey-975)] px-2.5 py-2 text-left opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-focus-within:visible group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <span className="block text-[10px] font-semibold text-white">{squad.label}</span>
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
  );
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
  onOpenShareout?: () => void;
}

/**
 * Full challenge summary + actionable panel for the bottom detail region on Community → Challenges.
 */
export const ChallengeFullDetail: React.FC<ChallengeFullDetailProps> = ({
  challenge,
  optedIn,
  onToggleOptIn,
  onOpenShareout,
}) => {
  const isCompleted = challenge.lifecycle === 'completed';
  const isUpcoming = challenge.lifecycle === 'upcoming';
  const isActive = challenge.lifecycle === 'active';
  const showGroupPlacement = !isUpcoming;
  const milestoneCaps = parseMilestoneNumericCaps(challenge);
  const goalTotal = parseChallengeGoalTotalUnits(challenge);
  const learnerGroupExplicit = challenge.groupProgressTowardGoal?.[challenge.groupIndex];
  /** Learner squad’s share of the final goal (falls back to card progress when no per-group map). */
  const progress01ForGoal =
    learnerGroupExplicit != null ? learnerGroupExplicit : challenge.cardProgress;
  const learnerUnitsCompleted =
    goalTotal != null
      ? Math.round(Math.min(1, Math.max(0, progress01ForGoal)) * goalTotal)
      : null;
  const useModuleConnectorModel =
    learnerUnitsCompleted != null &&
    milestoneCaps.length === challenge.milestones.length &&
    milestoneCaps.length >= 2;

  const tierIdx = useModuleConnectorModel
    ? tierColumnIndexForCompletedUnits(learnerUnitsCompleted, milestoneCaps)
    : resolveTierIndexForCard(challenge);

  const progressGoalLine =
    formatProgressGoalQuantityLineForFraction(challenge, progress01ForGoal) ??
    formatProgressGoalQuantityLine(challenge);
  const progressFallbackPct = `${Math.round(Math.min(1, Math.max(0, challenge.cardProgress)) * 100)}%`;
  const tierGroupsLayout = resolveGroupsAtTierColumns(challenge) ?? challenge.groupsAtMilestoneTier;
  const learnerGroupSquad = groupSquadForIndex(challenge.groupIndex);
  const [teamRankingsOpen, setTeamRankingsOpen] = useState(false);

  useEffect(() => {
    setTeamRankingsOpen(false);
  }, [challenge.id]);

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
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 flex flex-col gap-3">
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
          {(isActive && !optedIn) || isUpcoming ? (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
              {isActive && !optedIn && (
                <button
                  type="button"
                  onClick={onToggleOptIn}
                  className="rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-blue-700)] px-4 py-2 cds-action-secondary text-[var(--cds-color-white)] hover:bg-[var(--cds-color-blue-800)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]"
                >
                  Join challenge
                </button>
              )}
              {isUpcoming && optedIn && (
                <span
                  className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] px-4 py-2 cds-action-secondary text-[var(--cds-color-grey-975)] shadow-sm"
                  role="status"
                >
                  Set reminder
                </span>
              )}
              {isUpcoming && !optedIn && (
                <>
                  <button
                    type="button"
                    onClick={onToggleOptIn}
                    className="rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-blue-700)] px-4 py-2 cds-action-secondary text-[var(--cds-color-white)] hover:bg-[var(--cds-color-blue-800)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                  >
                    Remind me
                  </button>
                  <button
                    type="button"
                    onClick={onToggleOptIn}
                    className="rounded-[var(--cds-border-radius-100)] border border-white/35 bg-white/10 px-4 py-2 cds-action-secondary text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                  >
                    Join challenge
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {isCompleted && (
          <div className="overflow-hidden rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] bg-[#F0F9F4]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(180px,360px)] sm:items-stretch sm:gap-8">
              <div className="flex min-w-0 flex-col justify-center gap-4 px-4 pt-5 pb-0 sm:px-6 sm:py-6">
                <div>
                  <p className="text-xl font-bold leading-tight tracking-tight text-[var(--cds-color-grey-975)] sm:text-2xl">
                    {FEED_COHORT_META[challenge.cohortId].pillLabel} cohort challenge winners!
                  </p>
                  <p className="mt-2 text-sm font-medium leading-snug text-[var(--cds-color-grey-600)] sm:text-base">
                    {challenge.completedHeroSubline ?? `Great job ${learnerGroupSquad.label}!`}
                  </p>
                </div>
                {challenge.outcome && (
                  <p className="cds-body-secondary text-[var(--cds-color-grey-975)]">
                    You received the award for <strong>Longest Streak</strong>.
                  </p>
                )}
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
              <div className="relative h-full min-h-[180px] w-full overflow-hidden sm:min-h-0">
                <img
                  src="/challenges/completed-celebration-banner.png"
                  alt=""
                  className="h-full min-h-[180px] w-full object-cover object-right sm:min-h-0"
                  decoding="async"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}

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
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="cds-title-medium-sm text-[var(--cds-color-grey-975)]">
                {FEED_COHORT_META[challenge.cohortId].pillLabel}
              </span>
              <span
                className={`inline-flex max-w-full shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold leading-tight ${learnerGroupSquad.active}`}
              >
                {learnerGroupSquad.label}
              </span>
            </div>
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

            {tierGroupsLayout != null && (
              <div className="mt-4 border-t border-[var(--cds-color-grey-100)] pt-4">
                <button
                  type="button"
                  onClick={() => setTeamRankingsOpen((o) => !o)}
                  aria-expanded={teamRankingsOpen}
                  className="text-sm font-semibold text-[var(--cds-color-blue-700)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]"
                >
                  {teamRankingsOpen ? 'Hide team rankings' : 'See team rankings'}
                </button>
              </div>
            )}

            <div className={tierGroupsLayout != null ? 'mt-4' : 'mt-5'} role="list">
              <div className="flex items-start gap-0">
                {challenge.milestones.map((m, i) => {
                  const trackShowsLearnerProgress = optedIn;
                  const isHeadStep = trackShowsLearnerProgress && i === tierIdx;
                  const isCompletedTier =
                    trackShowsLearnerProgress && useModuleConnectorModel && i < tierIdx;
                  const gapCount = Math.max(0, challenge.milestones.length - 1);
                  const segmentFillPct = !trackShowsLearnerProgress
                    ? 0
                    : i > 0 && useModuleConnectorModel && learnerUnitsCompleted != null
                      ? connectorSegmentFillPercentForModules(i - 1, milestoneCaps, learnerUnitsCompleted)
                      : i > 0 && !useModuleConnectorModel && tierIdx > 0
                        ? connectorSegmentFillPercent(i - 1, gapCount, challenge.cardProgress)
                        : 0;
                  const { groupIds, tierIndexForResolver } = groupIdsAndTierIndexForMilestoneColumn(
                    tierGroupsLayout ?? undefined,
                    i
                  );
                  const isFinalMilestone = i === challenge.milestones.length - 1;
                  const showEmeraldCircle =
                    !isFinalMilestone && (isCompletedTier || isHeadStep);
                  return (
                    <React.Fragment key={m.id}>
                      {i > 0 && (
                        <div
                          className="relative z-0 flex h-16 min-w-0 flex-1 items-center self-start"
                          aria-hidden
                        >
                          <div className="absolute left-[-0.75rem] right-[-0.75rem] top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--cds-color-grey-200)]">
                            <div
                              className={`h-full rounded-full ${segmentFillPct > 0 ? 'bg-emerald-600' : 'bg-transparent'}`}
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
                          className={`relative z-[2] flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-4 ring-[var(--cds-color-grey-25)] ${
                            showEmeraldCircle
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[var(--cds-color-grey-200)] text-[var(--cds-color-grey-500)]'
                          }`}
                          aria-label={`${m.label}${m.target ? `, ${m.target}` : ''}`}
                        >
                          <span className="text-[20px] font-bold tabular-nums leading-none">
                            {milestoneQuantityLabel(m, i)}
                          </span>
                        </span>
                        {m.target && (
                          <span className="mt-2 line-clamp-2 text-[10px] text-[var(--cds-color-grey-600)]">{m.target}</span>
                        )}
                        {tierGroupsLayout != null && teamRankingsOpen && (
                          <div
                            className="mt-2 w-full min-w-0"
                            aria-label={`Team rankings at ${m.target ?? m.label}`}
                          >
                            <TierSquadStack
                              challenge={challenge}
                              milestoneLabel={m.label}
                              milestoneIndex={tierIndexForResolver}
                              groupIds={groupIds}
                            />
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
        )}

        {challenge.milestones.length > 0 &&
          !isUpcoming &&
          !isCompleted &&
          challenge.learnerContributionProgress != null && (
            <div className="rounded-[var(--cds-border-radius-100)] p-4">
              <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Your contribution</h4>
              <ul className="mt-3 space-y-2">
                <li className="flex flex-wrap items-center gap-2">
                  <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">
                    {formatProgressGoalQuantityLineForFraction(
                      challenge,
                      challenge.learnerContributionProgress
                    ) ?? `${Math.round(challenge.learnerContributionProgress * 100)}%`}{' '}
                    complete toward the group goal
                  </p>
                  <span
                    className="inline-flex shrink-0 rounded-full border border-[var(--cds-color-purple-200)] bg-[var(--cds-color-purple-25)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--cds-color-purple-800)] sm:text-[11px]"
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
        className="px-4 pb-5 pt-4 sm:px-5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <ChallengeDetailPanel
          challenge={challenge}
          optedIn={optedIn}
          onToggleOptIn={onToggleOptIn}
          onOpenShareout={onOpenShareout}
        />
      </div>
    </div>
  );
};
