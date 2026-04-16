import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import { Icons } from '../Icons';

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

  /** Fire as soon as a completed challenge with an outcome is shown (e.g. Completed tab), no scroll or delay. */
  useEffect(() => {
    if (!isCompleted || !challenge.outcome) return;
    if (confettiScheduledRef.current) return;
    confettiScheduledRef.current = true;

    queueMicrotask(() => {
      const el = outcomeHighlightRef.current;
      const rect = el?.getBoundingClientRect();
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const x = rect ? (rect.left + rect.width / 2) / w : 0.5;
      const y = rect ? (rect.top + rect.height / 2) / h : 0.45;
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
    });
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
          className="rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-white)] px-4 pb-4 pt-0"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="cds-body-secondary min-w-0 flex-1 text-[var(--cds-color-grey-975)]">
              Your group placed <strong>1st</strong> out of {challenge.groupCount} teams.
            </p>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] px-3 py-2 text-left cds-action-secondary text-[var(--cds-color-grey-975)] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]"
            >
              View team
              <Icons.ChevronDown className="h-4 w-4 shrink-0 text-[var(--cds-color-grey-600)]" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Primary CTAs for active (join) and upcoming (remind / set reminder) live in ChallengeFullDetail hero. */}
      {!isCompleted && !isUpcoming && optedIn && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleOptIn}
            className="rounded-[var(--cds-border-radius-100)] border-0 bg-transparent px-4 py-2 cds-action-secondary text-[var(--cds-color-blue-700)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cds-color-blue-700)]"
          >
            Leave challenge
          </button>
        </div>
      )}
    </div>
  );
};
