import React from 'react';
import type { CommunityChallenge } from '../../constants/communityChallenges';
import { ChallengeLeaderboardSnippet } from './ChallengeLeaderboardSnippet';

export interface ChallengeDetailPanelProps {
  challenge: CommunityChallenge;
  optedIn: boolean;
  onToggleOptIn: () => void;
  highFiveByMemberId?: Record<string, number>;
  onHighFive?: (memberId: string) => void;
  onOpenShareout?: () => void;
}

export const ChallengeDetailPanel: React.FC<ChallengeDetailPanelProps> = ({
  challenge,
  optedIn,
  onToggleOptIn,
  highFiveByMemberId = {},
  onHighFive,
  onOpenShareout,
}) => {
  const isCompleted = challenge.lifecycle === 'completed';

  return (
    <div className="space-y-5">
      <div>
        <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Actionable steps</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 cds-body-secondary text-[var(--cds-color-grey-700)]">
          {challenge.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {isCompleted && challenge.outcome && (
        <div className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-purple-100)] bg-[var(--cds-color-purple-25)] p-4">
          <p className="cds-body-secondary text-[var(--cds-color-grey-975)]">
            Your group placed <strong>1st</strong> out of {challenge.groupCount} sub-groups. Your contribution rank:{' '}
            <strong>#{challenge.outcome.userRank}</strong>.
          </p>
        </div>
      )}

      {isCompleted && challenge.members?.length && onHighFive && (
        <ChallengeLeaderboardSnippet
          members={challenge.members}
          highFiveByMemberId={highFiveByMemberId}
          onHighFive={onHighFive}
        />
      )}

      {isCompleted && onOpenShareout && (
        <button
          type="button"
          onClick={onOpenShareout}
          className="w-full rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-blue-700)] px-4 py-3 cds-action-secondary text-[var(--cds-color-white)] hover:bg-[var(--cds-color-blue-800)]"
        >
          View shareout graphic
        </button>
      )}

      {!isCompleted && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleOptIn}
            className={`rounded-[var(--cds-border-radius-100)] px-4 py-2 cds-action-secondary ${
              optedIn
                ? 'border border-[var(--cds-color-grey-200)] bg-[var(--cds-color-white)] text-[var(--cds-color-grey-975)] hover:bg-[var(--cds-color-grey-25)]'
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
