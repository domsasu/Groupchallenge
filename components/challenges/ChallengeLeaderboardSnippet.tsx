import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { ChallengeMember } from '../../constants/communityChallenges';
import { Hand } from 'lucide-react';

function burstSparksFromButton(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  const base = {
    origin: { x, y },
    particleCount: 28,
    spread: 65,
    startVelocity: 28,
    ticks: 100,
    gravity: 1.05,
    scalar: 0.85,
    colors: ['#FBBF24', '#F59E0B', '#FDE68A', '#60A5FA', '#FFFFFF'],
  };
  void confetti({ ...base, angle: 55 });
  void confetti({ ...base, angle: 125 });
}

export interface ChallengeLeaderboardSnippetProps {
  members: ChallengeMember[];
  highFiveByMemberId: Record<string, number>;
  onHighFive: (memberId: string) => void;
}

export const ChallengeLeaderboardSnippet: React.FC<ChallengeLeaderboardSnippetProps> = ({
  members,
  highFiveByMemberId,
  onHighFive,
}) => {
  const sorted = useMemo(() => {
    return [...members].sort((a, b) => b.contribution - a.contribution);
  }, [members]);

  return (
    <div className="mt-4">
      <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Top group contributors</h4>
      <p className="mt-1 cds-body-tertiary text-[var(--cds-color-grey-600)]">
        Ranked by contribution. High five peers—counts add to your shareout graphic.
      </p>
      <ul className="mt-3 space-y-2">
        {sorted.map((m, idx) => {
          const highFives = highFiveByMemberId[m.id] ?? m.highFiveCount;
          return (
            <li
              key={m.id}
              className={`flex items-center gap-3 rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-100)] px-3 py-2 ${
                m.isCurrentUser ? 'bg-[var(--cds-color-grey-50)]' : 'bg-[var(--cds-color-white)]'
              }`}
            >
              <span className="w-6 shrink-0 cds-body-secondary font-semibold text-[var(--cds-color-grey-500)]">{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <p
                  className={`cds-body-secondary text-[var(--cds-color-grey-975)] ${m.isCurrentUser ? 'font-bold' : 'font-medium'}`}
                >
                  {m.displayName}
                </p>
                <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">{m.contribution} pts contributed</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="cds-body-tertiary text-[var(--cds-color-grey-600)]">{highFives}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    burstSparksFromButton(e.currentTarget);
                    onHighFive(m.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-[var(--cds-color-grey-700)] transition hover:bg-[var(--cds-color-grey-25)] active:scale-95"
                  aria-label={`High five ${m.displayName}`}
                >
                  <Hand className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
