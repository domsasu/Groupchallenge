/**
 * Horizontal video strip for Community Feed — transparent chrome, scroll with prev/next.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FeedPlaceholderItem } from '../../constants/feedCohorts';
import {
  DATA_SCIENCE_DISCIPLINE_SLUG,
  FEED_DATA_SCIENCE_PREVIEW_VIDEOS,
} from '../../constants/feedPreviewVideos';
import { MiniFeedClipVideo } from '../MiniFeed';

const MAX_TILES = 40;
/** Five tiles across the scroller; `gap-4` → four gaps = `4rem`. */
const TILE_WIDTH_FIVE_ACROSS =
  'w-[calc((100%-4rem)/5)] min-w-0 max-w-[calc((100%-4rem)/5)] shrink-0';

const REEL =
  'aspect-[9/16] w-full min-w-0 max-w-[min(100%,calc(82dvh*9/16))] mx-auto shrink-0 overflow-hidden';
const FRAME = `relative ${REEL} rounded-t-[var(--cds-border-radius-200)] rounded-b-none bg-[var(--cds-color-grey-100)]`;

const FALLBACK_CLIPS = [
  '/videos/career-change-mini.mov',
  '/videos/coursera-video-mini.mov',
  '/videos/career-change-3-mini.mov',
];

function clipSrcForTile(tileIndex: number, dataScienceLensActive: boolean): string {
  if (dataScienceLensActive && tileIndex < FEED_DATA_SCIENCE_PREVIEW_VIDEOS.length) {
    return FEED_DATA_SCIENCE_PREVIEW_VIDEOS[tileIndex]!;
  }
  const ord = dataScienceLensActive ? tileIndex - FEED_DATA_SCIENCE_PREVIEW_VIDEOS.length : tileIndex;
  return FALLBACK_CLIPS[((ord % FALLBACK_CLIPS.length) + FALLBACK_CLIPS.length) % FALLBACK_CLIPS.length]!;
}

export interface FeedStackedGroupSectionProps {
  /** Stable key for tile React keys */
  sectionKey: string;
  items: FeedPlaceholderItem[];
  /** Discipline slugs from Feed pills — drives Data Science preview MOV routing (same as MiniFeed / FeedTimeline). */
  activeDisciplineSlugs: string[];
  /** Offset so each cohort row doesn’t reuse the same preview clip index 0..2 */
  previewIndexOffset?: number;
  /** Optional — e.g. focus cohort in sidebar */
  onSeeAll?: () => void;
  ariaLabel: string;
}

export const FeedStackedGroupSection: React.FC<FeedStackedGroupSectionProps> = ({
  sectionKey,
  items,
  activeDisciplineSlugs,
  previewIndexOffset = 0,
  onSeeAll,
  ariaLabel,
}) => {
  const dataScienceLensActive = activeDisciplineSlugs.includes(DATA_SCIENCE_DISCIPLINE_SLUG);
  const videoItems = useMemo(
    () => items.filter((i) => i.type === 'video').slice(0, MAX_TILES),
    [items]
  );

  const [clipUnmuted, setClipUnmuted] = useState(false);
  /** Only the hovered or focused tile plays; nothing autoplays on load. */
  const [playingTileIndex, setPlayingTileIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScrollButtons());
    ro.observe(el);
    return () => ro.disconnect();
  }, [videoItems, updateScrollButtons]);

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // One “page” ≈ five tiles (scroller viewport width).
    const delta = el.clientWidth * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
    window.setTimeout(updateScrollButtons, 350);
  }, [updateScrollButtons]);

  return (
    <section className="text-left" aria-label={ariaLabel}>
      {onSeeAll ? (
        <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onSeeAll}
            className="inline-flex items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] focus-visible:ring-offset-2"
          >
            <span className="cds-subtitle-md text-[var(--cds-color-grey-975)]">See all</span>
            <span className="material-symbols-rounded text-[var(--cds-color-grey-600)]" style={{ fontSize: '20px' }}>
              arrow_forward
            </span>
          </button>
        </div>
      ) : null}

      {/* Chevrons sit half outside the strip (centered on the left/right rails); strip stays full column width. */}
      <div className="relative isolate min-h-0 w-full overflow-visible">
        <button
          type="button"
          tabIndex={canScrollLeft ? 0 : -1}
          disabled={!canScrollLeft}
          onClick={() => scrollByPage(-1)}
          aria-label="Show previous videos"
          className="absolute left-2 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] text-[var(--cds-color-grey-800)] shadow-sm transition hover:bg-[var(--cds-color-grey-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] disabled:pointer-events-none disabled:opacity-30 sm:left-0 sm:-translate-x-1/2"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            chevron_left
          </span>
        </button>

        <div
          ref={scrollerRef}
          onScroll={updateScrollButtons}
          onMouseLeave={() => setPlayingTileIndex(null)}
          className="flex min-h-0 min-w-0 w-full gap-4 overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videoItems.map((item, i) => {
            const rowKey = `${sectionKey}-${i}-${item.title.slice(0, 24)}`;

            const tileBase = `flex h-full flex-col overflow-hidden rounded-[var(--cds-border-radius-200)] border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-grey-25)] text-left transition-colors hover:border-[var(--cds-color-grey-200)] hover:bg-[var(--cds-color-grey-50)] ${TILE_WIDTH_FIVE_ACROSS}`;

            const globalVid = previewIndexOffset + i;
            const clipSrc = clipSrcForTile(globalVid, dataScienceLensActive);
            const isActiveSegment = playingTileIndex === i;

            return (
              <div
                key={rowKey}
                role="button"
                tabIndex={0}
                className={`${tileBase} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] focus-visible:ring-offset-2`}
                onMouseEnter={() => setPlayingTileIndex(i)}
                onFocusCapture={() => setPlayingTileIndex(i)}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setPlayingTileIndex(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSeeAll?.();
                  }
                }}
              >
                <div className={`${FRAME} group`}>
                  <MiniFeedClipVideo
                    sectionActive
                    isActiveSegment={isActiveSegment}
                    segmentNonce={0}
                    userUnmuted={clipUnmuted}
                    onToggleMute={() => setClipUnmuted((m) => !m)}
                    src={clipSrc}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-end px-2.5 pb-2.5 pt-2">
                  <p className="cds-body-secondary line-clamp-2 text-[var(--cds-color-grey-975)]">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          tabIndex={canScrollRight ? 0 : -1}
          disabled={!canScrollRight}
          onClick={() => scrollByPage(1)}
          aria-label="Show more videos"
          className="absolute right-2 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--cds-color-grey-100)] bg-[var(--cds-color-white)] text-[var(--cds-color-grey-800)] shadow-sm transition hover:bg-[var(--cds-color-grey-50)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cds-color-blue-700)] disabled:pointer-events-none disabled:opacity-30 sm:right-0 sm:translate-x-1/2"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            chevron_right
          </span>
        </button>
      </div>
    </section>
  );
};
