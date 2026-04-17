import { MOCK_COMMUNITY_CHALLENGES, type CommunityChallenge } from './communityChallenges';

/** Bump version to reset persisted enrollment to mock defaults (e.g. after join-flow behavior changes). */
const STORAGE_KEY = 'groupchallenge.communityChallenges.v4';

/** Preview challenge: do not persist enrollment — avoids “always Joined” after localStorage + hot reload during dev. */
export const VIBE_CHALLENGE_ID = 'ch-active-ai-vibe-coding' as const;

export type StoredChallengeFields = Pick<
  CommunityChallenge,
  'optedIn' | 'groupIndex' | 'learnerContributionProgress'
>;

export type ChallengeOverridesMap = Record<string, Partial<StoredChallengeFields>>;

function readOverrides(): ChallengeOverridesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ChallengeOverridesMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOverrides(map: ChallengeOverridesMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

/** Merge mock challenges with enrollment saved from Community → Challenges (join flow). */
export function mergeCommunityChallengesWithStorage(base: CommunityChallenge[]): CommunityChallenge[] {
  const overrides = readOverrides();
  return base.map((c) => {
    if (c.id === VIBE_CHALLENGE_ID) return c;
    const o = overrides[c.id];
    if (!o) return c;
    return {
      ...c,
      ...o,
    };
  });
}

/** Diff vs mock defaults — only persist fields we allow overriding. */
export function persistChallengesFromMock(current: CommunityChallenge[]): void {
  const mockById = new Map(MOCK_COMMUNITY_CHALLENGES.map((c) => [c.id, c]));
  const next: ChallengeOverridesMap = {};
  for (const c of current) {
    if (c.id === VIBE_CHALLENGE_ID) continue;
    const m = mockById.get(c.id);
    if (!m) continue;
    const patch: Partial<StoredChallengeFields> = {};
    if (c.optedIn !== m.optedIn) patch.optedIn = c.optedIn;
    if (c.groupIndex !== m.groupIndex) patch.groupIndex = c.groupIndex;
    if (c.learnerContributionProgress !== m.learnerContributionProgress) {
      patch.learnerContributionProgress = c.learnerContributionProgress;
    }
    if (Object.keys(patch).length > 0) next[c.id] = patch;
  }
  writeOverrides(next);
}
