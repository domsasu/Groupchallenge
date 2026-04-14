import React, { useCallback, useMemo, useState } from 'react';
import {
  MOCK_COMMUNITY_CHALLENGES,
  challengesForLifecycle,
  sortChallengesByJoinedCohortOrder,
  type ChallengeLifecycle,
  type CommunityChallenge,
} from '../../constants/communityChallenges';
import { FEED_COHORT_META, JOINED_FEED_COHORT_IDS, type FeedCohortId } from '../../constants/feedCohorts';
import { ChallengeCard } from './ChallengeCard';
import { ChallengeShareoutModal } from './ChallengeShareoutModal';

const STATUS_TABS: { id: ChallengeLifecycle; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

function initHighFiveMap(challenge: CommunityChallenge | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!challenge?.members) return out;
  for (const m of challenge.members) {
    out[m.id] = m.highFiveCount;
  }
  return out;
}

export const ChallengesView: React.FC = () => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(() =>
    MOCK_COMMUNITY_CHALLENGES.map((c) => ({ ...c, members: c.members?.map((m) => ({ ...m })) }))
  );
  const [statusTab, setStatusTab] = useState<ChallengeLifecycle>('active');
  const [shareoutId, setShareoutId] = useState<string | null>(null);
  const [highFiveByMemberId, setHighFiveByMemberId] = useState<Record<string, number>>(() =>
    initHighFiveMap(MOCK_COMMUNITY_CHALLENGES.find((c) => c.lifecycle === 'completed'))
  );

  const shareoutChallenge = useMemo(
    () => (shareoutId ? challenges.find((c) => c.id === shareoutId) ?? null : null),
    [challenges, shareoutId]
  );

  const filtered = useMemo(
    () =>
      sortChallengesByJoinedCohortOrder(challengesForLifecycle(challenges, statusTab)),
    [challenges, statusTab]
  );

  /** Joined cohorts with no challenge in Upcoming (e.g. cohort only has Active). */
  const cohortIdsWithoutUpcomingChallenge = useMemo(() => {
    if (statusTab !== 'upcoming') return [];
    const withUpcoming = new Set(
      challenges.filter((c) => c.lifecycle === 'upcoming').map((c) => c.cohortId)
    );
    return JOINED_FEED_COHORT_IDS.filter((id) => !withUpcoming.has(id));
  }, [challenges, statusTab]);

  const suggestChallengeForCohort = useCallback((cohortLabel: string) => {
    window.alert(
      `Challenge proposals for ${cohortLabel} will be reviewed by cohort moderators. This is a preview—no request was sent.`
    );
  }, []);

  const totalHighFivesForShareout = useMemo(() => {
    const ch = shareoutChallenge;
    if (!ch?.members) return 0;
    return ch.members.reduce((sum, m) => sum + (highFiveByMemberId[m.id] ?? m.highFiveCount), 0);
  }, [shareoutChallenge, highFiveByMemberId]);

  const toggleOptedIn = useCallback((id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, optedIn: !c.optedIn } : c))
    );
  }, []);

  const onHighFive = useCallback((memberId: string) => {
    setHighFiveByMemberId((prev) => {
      let base = 0;
      for (const c of challenges) {
        const m = c.members?.find((x) => x.id === memberId);
        if (m) {
          base = m.highFiveCount;
          break;
        }
      }
      const cur = prev[memberId] ?? base;
      return { ...prev, [memberId]: cur + 1 };
    });
  }, [challenges]);

  return (
    <div className="space-y-6">
      {/* Secondary tabs */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Challenge status"
      >
        {STATUS_TABS.map((t) => {
          const selected = statusTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`challenge-status-${t.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setStatusTab(t.id)}
              className={`rounded-full px-4 py-2 cds-body-secondary transition-colors ${
                selected
                  ? 'bg-[var(--cds-color-white)] text-[var(--cds-color-grey-975)] shadow-sm ring-1 ring-[var(--cds-color-grey-200)]'
                  : 'bg-[var(--cds-color-grey-100)] text-[var(--cds-color-grey-700)] hover:bg-[var(--cds-color-grey-200)]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Challenge cards — cohorts that have a challenge in this status */}
      <div className="space-y-4" role="tabpanel" aria-labelledby={`challenge-status-${statusTab}`}>
        {filtered.length === 0 &&
        !(statusTab === 'upcoming' && cohortIdsWithoutUpcomingChallenge.length > 0) ? (
          <p className="cds-body-secondary text-[var(--cds-color-grey-600)]">No challenges in this category.</p>
        ) : (
          filtered.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              optedIn={c.optedIn}
              onToggleOptIn={() => toggleOptedIn(c.id)}
              highFiveByMemberId={highFiveByMemberId}
              onHighFive={c.lifecycle === 'completed' ? onHighFive : undefined}
              onOpenShareout={
                c.lifecycle === 'completed' && c.outcome?.won ? () => setShareoutId(c.id) : undefined
              }
            />
          ))
        )}
      </div>

      {/* Upcoming: suggest a challenge for joined cohorts that have nothing scheduled */}
      {statusTab === 'upcoming' &&
        cohortIdsWithoutUpcomingChallenge.map((cohortId: FeedCohortId) => {
          const meta = FEED_COHORT_META[cohortId];
          return (
            <div
              key={cohortId}
              className="pointer-events-none rounded-[var(--cds-border-radius-200)] border border-dashed border-[var(--cds-color-grey-200)] bg-transparent p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--cds-color-blue-25)] px-2.5 py-0.5 cds-body-secondary text-[var(--cds-color-grey-975)]">
                      {meta.pillLabel}
                    </span>
                  </div>
                  <h3 className="cds-subtitle-md text-[var(--cds-color-grey-975)]">No upcoming challenge</h3>
                  <p className="mt-1 cds-body-tertiary text-[var(--cds-color-grey-600)]">
                    {meta.label} · {meta.memberCount.toLocaleString()} members
                  </p>
                  <p className="mt-3 cds-body-secondary text-[var(--cds-color-grey-700)]">
                    There isn&apos;t an upcoming group challenge for this cohort yet. Suggest one so learners can opt in
                    when it starts.
                  </p>
                </div>
                <div className="pointer-events-auto flex shrink-0 flex-col gap-2 sm:items-end">
                  <button
                    type="button"
                    onClick={() => suggestChallengeForCohort(meta.label)}
                    className="cds-action-secondary rounded-[var(--cds-border-radius-100)] px-4 py-2 text-[var(--cds-color-blue-700)] hover:bg-[var(--cds-color-blue-25)]"
                  >
                    Suggest a challenge
                  </button>
                </div>
              </div>
            </div>
          );
        })}

      <ChallengeShareoutModal
        isOpen={shareoutId != null && shareoutChallenge != null}
        onClose={() => setShareoutId(null)}
        challengeName={shareoutChallenge?.name ?? ''}
        peerCount={shareoutChallenge?.outcome?.shareoutPeerCount ?? 0}
        totalHighFives={totalHighFivesForShareout}
        onSharePlaceholder={() => {
          window.alert('Share sheet would open here (preview).');
        }}
      />
    </div>
  );
};
