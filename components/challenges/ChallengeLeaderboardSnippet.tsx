import React, { useMemo } from 'react';
import type { ChallengeMember } from '../../constants/communityChallenges';
import { Hand } from 'lucide-react';

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
      <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Group contributors</h4>
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
                m.isCurrentUser ? 'bg-[var(--cds-color-yellow-25)]' : 'bg-[var(--cds-color-white)]'
              }`}
            >
              <span className="w-6 shrink-0 cds-body-secondary font-semibold text-[var(--cds-color-grey-500)]">{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="cds-body-secondary font-medium text-[var(--cds-color-grey-975)]">{m.displayName}</p>
                <p className="cds-body-tertiary text-[var(--cds-color-grey-600)]">{m.contribution} pts contributed</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="cds-body-tertiary text-[var(--cds-color-grey-600)]">{highFives}</span>
                <button
                  type="button"
                  onClick={() => onHighFive(m.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] text-[var(--cds-color-grey-700)] transition-colors hover:bg-[var(--cds-color-blue-25)] hover:text-[var(--cds-color-blue-800)]"
                  aria-label={`High five ${m.displayName}`}
                >
                  <Hand className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
