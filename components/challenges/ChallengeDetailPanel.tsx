import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import { ChallengeLeaderboardSnippet } from './ChallengeLeaderboardSnippet';

export interface ChallengeDetailPanelProps {
  challenge: CommunityChallenge;
  optedIn: boolean;
  onToggleOptIn: () => void;
  onOpenShareout?: () => void;
}

export const ChallengeDetailPanel: React.FC<ChallengeDetailPanelProps> = ({
  challenge,
  optedIn,
  onToggleOptIn,
  onOpenShareout,
}) => {
  const isCompleted = challenge.lifecycle === 'completed';
  const isUpcoming = challenge.lifecycle === 'upcoming';
  const outcomeHighlightRef = useRef<HTMLDivElement | null>(null);
  const confettiScheduledRef = useRef(false);

  useEffect(() => {
    confettiScheduledRef.current = false;
  }, [challenge.id]);

  useEffect(() => {
    if (!isCompleted || !challenge.outcome) return;
    const el = outcomeHighlightRef.current;
    if (!el) return;

    let delayId: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || confettiScheduledRef.current) return;
        confettiScheduledRef.current = true;

        delayId = setTimeout(() => {
          const rect = el.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          const burst = {
            origin: { x, y } as const,
            particleCount: 85,
            spread: 70,
            startVelocity: 36,
            ticks: 200,
            gravity: 0.9,
          };
          void confetti({ ...burst, angle: 55 });
          void confetti({ ...burst, angle: 125 });
        }, 700);
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (delayId !== undefined) clearTimeout(delayId);
    };
  }, [isCompleted, challenge.outcome, challenge.id]);

  return (
    <div className="space-y-5">
      {!isCompleted && (
        <div>
          <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Actionable steps</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 cds-body-secondary text-[var(--cds-color-grey-700)]">
            {challenge.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {isCompleted && challenge.outcome && (
        <div
          ref={outcomeHighlightRef}
          className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] p-4"
        >
          <p className="cds-body-secondary text-[var(--cds-color-grey-975)]">
            Your group placed <strong>1st</strong> out of {challenge.groupCount} sub-groups. Your contribution rank:{' '}
            <strong>#{challenge.outcome.userRank}</strong>.
          </p>
        </div>
      )}

      {isCompleted && challenge.members?.length && (
        <ChallengeLeaderboardSnippet members={challenge.members} />
      )}

      {!isCompleted && isUpcoming && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {optedIn ? (
            <span
              className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] px-4 py-2 cds-action-secondary text-[var(--cds-color-grey-975)]"
              role="status"
            >
              Set reminder
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleOptIn}
                className="rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-blue-700)] px-4 py-2 cds-action-secondary text-[var(--cds-color-white)] hover:bg-[var(--cds-color-blue-800)]"
              >
                Remind me
              </button>
              <button
                type="button"
                onClick={onToggleOptIn}
                className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] px-4 py-2 cds-action-secondary text-[var(--cds-color-grey-975)] hover:bg-[var(--cds-color-grey-25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]"
              >
                Join challenge
              </button>
            </>
          )}
        </div>
      )}

      {!isCompleted && !isUpcoming && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleOptIn}
            className={`rounded-[var(--cds-border-radius-100)] px-4 py-2 cds-action-secondary ${
              optedIn
                ? 'border-0 bg-transparent text-[var(--cds-color-blue-700)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]'
                : 'bg-[var(--cds-color-blue-700)] text-[var(--cds-color-white)] hover:bg-[var(--cds-color-blue-800)]'
            }`}
          >
            {optedIn ? 'Leave challenge' : 'Join challenge'}
          </button>
        </div>
      )}
    </div>
  );
};
