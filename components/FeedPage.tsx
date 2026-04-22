import React, { useEffect, useMemo, useState } from 'react';
import { useSiteVariant } from '../context/SiteVariantContext';
import {
  JOINABLE_FEED_COHORT_IDS,
  JOINED_FEED_COHORT_IDS,
  getAllStreamFeedPlaceholderItems,
  type FeedCohortId,
  type FeedPlaceholderItem,
} from '../constants/feedCohorts';
import { FeedCohortPills, type FeedPillSelection } from './feed/FeedCohortPills';
import { FeedStackedGroupSection } from './feed/FeedStackedGroupSection';
import { Icons } from './Icons';
import { enrichFeedVideoThumbnails } from '../services/unsplashThumbnails';
import { ChallengesView } from './challenges/ChallengesView';
import { CommunityLeaderboardPanel } from './CommunityLeaderboardPanel';
import type { CohortId } from './MyLearning';

export type CommunitySurface = 'feed' | 'challenges' | 'leaderboard';

export interface FeedPageProps {
  /** Open Community on a specific tab (e.g. deep link from Home). Defaults to Feed. */
  initialCommunityTab?: CommunitySurface;
}

export const FeedPage: React.FC<FeedPageProps> = ({ initialCommunityTab }) => {
  const { variant, surface } = useSiteVariant();
  /** One active topic filter or none — none loads the full interleaved stream. */
  const [pillSelection, setPillSelection] = useState<FeedPillSelection>({ kind: 'none' });

  const activeDisciplineSlugs = useMemo((): string[] => {
    if (pillSelection.kind === 'topic') return [pillSelection.slug];
    return [];
  }, [pillSelection]);

  const [communitySurface, setCommunitySurface] = useState<CommunitySurface>(
    () => initialCommunityTab ?? 'feed'
  );
  const [leaderboardCohortId, setLeaderboardCohortId] = useState<CohortId>('workingparents');

  useEffect(() => {
    if (initialCommunityTab) setCommunitySurface(initialCommunityTab);
  }, [initialCommunityTab]);

  const allStreamCohortIds = useMemo(
    () => [...JOINED_FEED_COHORT_IDS, ...JOINABLE_FEED_COHORT_IDS],
    []
  );

  const disciplineKey = useMemo(
    () => [...activeDisciplineSlugs].sort().join('|'),
    [activeDisciplineSlugs]
  );

  /** Discipline-first stream (all joined + discover cohorts interleaved), ordered by active browse tags. */
  const disciplineStreamItems = useMemo(
    () =>
      getAllStreamFeedPlaceholderItems(allStreamCohortIds, {
        disciplineSlugs: activeDisciplineSlugs,
      }),
    [allStreamCohortIds, activeDisciplineSlugs]
  );

  const flatForThumbnailEnrich = useMemo(() => [...disciplineStreamItems], [disciplineStreamItems]);

  const [stackItemsEnriched, setStackItemsEnriched] = useState<FeedPlaceholderItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStackItemsEnriched(null);
    enrichFeedVideoThumbnails(flatForThumbnailEnrich).then((enriched) => {
      if (!cancelled) setStackItemsEnriched(enriched);
    });
    return () => {
      cancelled = true;
    };
  }, [flatForThumbnailEnrich]);

  const stackedFeedSlices = useMemo(() => {
    const flat = stackItemsEnriched ?? flatForThumbnailEnrich;
    const dLen = disciplineStreamItems.length;
    const disciplineItems = flat.slice(0, dLen);
    return { disciplineItems };
  }, [stackItemsEnriched, flatForThumbnailEnrich, disciplineStreamItems]);

  return (
    <div className="flex-1 bg-[var(--cds-color-grey-25)] overflow-y-auto custom-scrollbar">
      <div
        className={`relative bg-[var(--cds-color-grey-25)] min-h-[min(100%,calc(100vh-5rem))] ${surface.feedBackdropExtraClassName}`}
        data-site-variant={variant}
      >
        {/* Full-bleed white bar so no grey shows at viewport edges; tab labels align with page column below. */}
        <div className="sticky top-0 z-50 mb-5 w-full min-w-0 border-b border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] shadow-sm">
          <div className="mx-auto max-w-[1440px] px-4 pt-4 md:px-6 md:pt-5">
            <div className="flex gap-6" role="tablist" aria-label="Community">
              <button
                type="button"
                role="tab"
                id="community-tab-feed"
                aria-controls="community-panel-feed"
                aria-selected={communitySurface === 'feed'}
                tabIndex={communitySurface === 'feed' ? 0 : -1}
                onClick={() => setCommunitySurface('feed')}
                className={`cds-body-secondary border-b-2 py-3 transition-colors ${
                  communitySurface === 'feed'
                    ? 'border-[var(--cds-color-grey-975)] font-semibold text-[var(--cds-color-grey-975)]'
                    : 'border-transparent text-[var(--cds-color-grey-600)] hover:text-[var(--cds-color-grey-975)]'
                }`}
              >
                Feed
              </button>
              <button
                type="button"
                role="tab"
                id="community-tab-challenges"
                aria-controls="community-panel-challenges"
                aria-selected={communitySurface === 'challenges'}
                tabIndex={communitySurface === 'challenges' ? 0 : -1}
                onClick={() => setCommunitySurface('challenges')}
                className={`cds-body-secondary border-b-2 py-3 transition-colors ${
                  communitySurface === 'challenges'
                    ? 'border-[var(--cds-color-grey-975)] font-semibold text-[var(--cds-color-grey-975)]'
                    : 'border-transparent text-[var(--cds-color-grey-600)] hover:text-[var(--cds-color-grey-975)]'
                }`}
              >
                Challenges
              </button>
              <button
                type="button"
                role="tab"
                id="community-tab-leaderboard"
                aria-controls="community-panel-leaderboard"
                aria-selected={communitySurface === 'leaderboard'}
                tabIndex={communitySurface === 'leaderboard' ? 0 : -1}
                onClick={() => setCommunitySurface('leaderboard')}
                className={`cds-body-secondary border-b-2 py-3 transition-colors ${
                  communitySurface === 'leaderboard'
                    ? 'border-[var(--cds-color-grey-975)] font-semibold text-[var(--cds-color-grey-975)]'
                    : 'border-transparent text-[var(--cds-color-grey-600)] hover:text-[var(--cds-color-grey-975)]'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-0 mx-auto max-w-[1440px] px-6 pb-10 pt-0 md:pb-12 space-y-10">
          {communitySurface === 'feed' && (
            <div id="community-panel-feed" role="tabpanel" aria-labelledby="community-tab-feed" className="relative z-0">
              <div className="mb-5 flex min-w-0 items-start gap-3">
                <div className="min-w-0 flex-1">
                  <FeedCohortPills
                    variant="coursera"
                    pillSelection={pillSelection}
                    onSelectTopic={(slug) =>
                      setPillSelection((prev) =>
                        prev.kind === 'topic' && prev.slug === slug ? { kind: 'none' } : { kind: 'topic', slug }
                      )
                    }
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-[#111111] transition-colors hover:bg-[var(--cds-color-grey-100)]"
                    aria-label="Filters (placeholder)"
                  >
                    <Icons.FilterSliders className="h-5 w-5 text-[#111111]" strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-[#111111] transition-colors hover:bg-[var(--cds-color-grey-100)]"
                    aria-label="Search (placeholder)"
                  >
                    <Icons.Search className="h-5 w-5 text-[#111111]" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-6">
                <FeedStackedGroupSection
                  key={`discipline-${disciplineKey}`}
                  sectionKey={`discipline-${disciplineKey}`}
                  items={stackedFeedSlices.disciplineItems}
                  activeDisciplineSlugs={activeDisciplineSlugs}
                  previewIndexOffset={0}
                  ariaLabel="Videos matched to your selected Coursera topics across communities."
                />
              </div>
            </div>
          )}

          {communitySurface === 'challenges' && (
            <div
              role="tabpanel"
              aria-labelledby="community-tab-challenges"
              id="community-panel-challenges"
              className="relative z-0"
            >
              <ChallengesView />
            </div>
          )}

          {communitySurface === 'leaderboard' && (
            <div
              id="community-panel-leaderboard"
              role="tabpanel"
              aria-labelledby="community-tab-leaderboard"
              className="relative z-0"
            >
              <CommunityLeaderboardPanel
                selectedCohort={leaderboardCohortId}
                onSelectCohort={setLeaderboardCohortId}
                headingId="community-leaderboard-heading"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
