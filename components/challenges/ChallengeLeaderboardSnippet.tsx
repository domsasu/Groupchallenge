import React from 'react';
import type { ChallengeMember } from '../../constants/communityChallenges';

export interface ChallengeLeaderboardSnippetProps {
  members: ChallengeMember[];
}

export const ChallengeLeaderboardSnippet: React.FC<ChallengeLeaderboardSnippetProps> = ({ members }) => {
  const isCurrentUser = members.some((m) => m.isCurrentUser);

  return (
    <div className="mt-4">
      <h4 className="cds-subtitle-sm text-[var(--cds-color-grey-975)]">Recognition</h4>
      <p className="mt-1 cds-body-secondary text-[var(--cds-color-grey-975)]">
        {isCurrentUser ? (
          <>
            You received the award for <strong>Longest Streak</strong>.
          </>
        ) : (
          <>
            This learner received the award for <strong>Longest Streak</strong>.
          </>
        )}
      </p>
    </div>
  );
};
