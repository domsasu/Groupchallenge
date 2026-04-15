import React, { useEffect, useMemo, useState } from 'react';
import { useSiteVariant } from '../context/SiteVariantContext';
import {
  DEFAULT_FEED_DISCIPLINE_SLUGS,
  JOINABLE_FEED_COHORT_IDS,
  JOINED_FEED_COHORT_IDS,
  getAllStreamFeedPlaceholderItems,
  getFeedPlaceholderItems,
  type FeedCohortId,
  type FeedPlaceholderItem,
} from '../constants/feedCohorts';
import { FeedCohortPills } from './feed/FeedCohortPills';
import { FeedDiscoverRail } from './feed/FeedDiscoverRail';
import { FeedTimeline } from './feed/FeedTimeline';
import { Icons } from './Icons';
import { enrichFeedVideoThumbnails } from '../services/unsplashThumbnails';
import { ChallengesView } from './challenges/ChallengesView';

export type CommunitySurface = 'feed' | 'challenges';

export interface FeedPageProps {
  /** When opening Community from Home mini-feed, select this cohort (same as mini-feed lead cohort). */
  initialSelectedCohortId?: FeedCohortId;
  /** Open Community on Feed vs Challenges (e.g. deep link from Home). */
  initialCommunityTab?: CommunitySurface;
}

export const FeedPage: React.FC<FeedPageProps> = ({ initialSelectedCohortId, initialCommunityTab }) => {
  const { variant, surface } = useSiteVariant();
  /** `null` = All snacks stream (mixed cohorts). */
  const [selectedCohortId, setSelectedCohortId] = useState<FeedCohortId | null>(
    () => initialSelectedCohortId ?? null
  );
  /** Multi-select Coursera browse disciplines; empty = same as “All” (no discipline lens). */
  const [activeDisciplineSlugs, setActiveDisciplineSlugs] = useState<string[]>(() => [
    ...DEFAULT_FEED_DISCIPLINE_SLUGS,
  ]);
  /** Cohorts the user joined via the rail CTA (moved from discover into “yours”). */
  const [joinedViaRailIds, setJoinedViaRailIds] = useState<FeedCohortId[]>([]);

  const [communitySurface, setCommunitySurface] = useState<CommunitySurface>(
    () => initialCommunityTab ?? 'challenges'
  );

  useEffect(() => {
    if (initialCommunityTab) setCommunitySurface(initialCommunityTab);
  }, [initialCommunityTab]);

  const railJoinedIds = useMemo(
    () => [...JOINED_FEED_COHORT_IDS, ...joinedViaRailIds],
    [joinedViaRailIds]
  );
  const railJoinableIds = useMemo(
    () => JOINABLE_FEED_COHORT_IDS.filter((id) => !joinedViaRailIds.includes(id)),
    [joinedViaRailIds]
  );

  const allStreamCohortIds = useMemo(
    () => [...railJoinedIds, ...railJoinableIds],
    [railJoinedIds, railJoinableIds]
  );

  const disciplineKey = useMemo(
    () => [...activeDisciplineSlugs].sort().join('|'),
    [activeDisciplineSlugs]
  );

  const feedItems = useMemo(
    () =>
      selectedCohortId === null
        ? getAllStreamFeedPlaceholderItems(allStreamCohortIds, {
            disciplineSlugs: activeDisciplineSlugs,
          })
        : getFeedPlaceholderItems(selectedCohortId, {
            disciplineSlugs: activeDisciplineSlugs,
          }),
    [selectedCohortId, allStreamCohortIds, activeDisciplineSlugs]
  );

  const [feedItemsWithThumbs, setFeedItemsWithThumbs] = useState<FeedPlaceholderItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFeedItemsWithThumbs(null);
    enrichFeedVideoThumbnails(feedItems).then((enriched) => {
      if (!cancelled) setFeedItemsWithThumbs(enriched);
    });
    return () => {
      cancelled = true;
    };
  }, [feedItems]);

  const timelineItems = feedItemsWithThumbs ?? feedItems;

  return (
    <div className="flex-1 bg-[var(--cds-color-grey-25)] overflow-y-auto custom-scrollbar">
      <div
        className={`relative bg-[var(--cds-color-grey-25)] min-h-[min(100%,calc(100vh-5rem))] ${surface.feedBackdropExtraClassName}`}
        data-site-variant={variant}
      >
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-6 pb-4 md:pb-5 pt-0">
          {/* Primary: Feed vs Challenges — underline style (matches My Learning tabs). Top padding lives on the white bar so no grey-25 gap sits above the tabs. */}
          <div className="sticky top-0 z-10 -mx-4 md:-mx-6 mb-5 border-b border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] px-4 md:px-6 pt-4 md:pt-5">
            <div className="flex gap-6" role="tablist" aria-label="Community">
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
            </div>
          </div>

          {communitySurface === 'feed' ? (
            <div id="community-panel-feed" role="tabpanel" aria-labelledby="community-tab-feed">
              <div className="mb-5 flex min-w-0 items-start gap-3">
                <div className="min-w-0 flex-1">
                  <FeedCohortPills
                    variant="coursera"
                    selectedSlugs={activeDisciplineSlugs}
                    onToggleSlug={(slug) => {
                      setActiveDisciplineSlugs((prev) =>
                        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
                      );
                    }}
                    onClearDisciplines={() => setActiveDisciplineSlugs([])}
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

              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-4">
                <div className="order-1 min-w-0 lg:col-span-9">
                  <FeedTimeline
                    key={`${selectedCohortId ?? 'all'}-${disciplineKey}`}
                    cohortId={selectedCohortId ?? 'all'}
                    items={timelineItems}
                    activeDisciplineSlugs={activeDisciplineSlugs}
                  />
                </div>
                <div className="order-2 min-w-0 lg:col-span-3">
                  <FeedDiscoverRail
                    activeCohortId={selectedCohortId}
                    onSelectCohort={setSelectedCohortId}
                    joinedCohortIds={railJoinedIds}
                    joinableCohortIds={railJoinableIds}
                    onJoinCohort={(id) => {
                      setJoinedViaRailIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
                      setSelectedCohortId(id);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div role="tabpanel" aria-labelledby="community-tab-challenges" id="community-panel-challenges">
              <ChallengesView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
