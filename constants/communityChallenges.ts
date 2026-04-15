import { JOINED_FEED_COHORT_IDS, type FeedCohortId } from './feedCohorts';

/**
 * Mock challenges use only cohorts the learner has joined — same set/order as
 * `JOINED_FEED_COHORT_IDS` in feedCohorts (Career switchers, Coursera community, AI & data).
 */

export type ChallengeLifecycle = 'active' | 'upcoming' | 'completed';

/** Visual tier for strip card art + labels (Silver / Gold / Platinum / Diamond). */
export type ChallengeVisualTier = 'silver' | 'gold' | 'platinum' | 'diamond';

export interface ChallengeMilestone {
  id: string;
  label: string;
  /** Display like "5 lessons" */
  target?: string;
}

export interface ChallengeMember {
  id: string;
  displayName: string;
  /** Contribution points for ranking */
  contribution: number;
  /** Initial high-fives from mock; UI can increment */
  highFiveCount: number;
  /** Highlight current user */
  isCurrentUser?: boolean;
}

export interface CommunityChallenge {
  id: string;
  name: string;
  cohortId: FeedCohortId;
  lifecycle: ChallengeLifecycle;
  /** 1-based */
  groupIndex: number;
  groupCount: number;
  /** This group's rank among all groups in the challenge (1 = leading). */
  groupPlace: number;
  approxGroupSize: number;
  whyJoin: string;
  milestones: ChallengeMilestone[];
  /** 0-based index into `milestones` — tier this group is in (highlighted on the card). */
  currentTierIndex?: number;
  /**
   * For each milestone index, 1-based group numbers whose **current** highest tier is exactly
   * that milestone (each group appears once across the array).
   */
  groupsAtMilestoneTier?: number[][];
  steps: string[];
  /** ISO date strings for display */
  startsAt: string;
  endsAt: string;
  daysLeft?: number;
  /** Simulated enrollment */
  optedIn: boolean;
  outcome?: {
    won: boolean;
    /** User's rank in group when completed */
    userRank: number;
    /** Headline number for shareout (e.g. peers in group) */
    shareoutPeerCount: number;
  };
  members?: ChallengeMember[];
  /** Tier shown on challenge strip card illustration and footer (independent of milestone naming). */
  visualTier: ChallengeVisualTier;
  /** Progress toward current challenge goal, 0–1 (drives progress bar on strip card). */
  cardProgress: number;
}

export const MOCK_COMMUNITY_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'ch-active-career-20',
    name: '20 Lessons Habit Challenge',
    cohortId: 'careerswitchers',
    lifecycle: 'active',
    groupIndex: 3,
    groupCount: 5,
    groupPlace: 2,
    approxGroupSize: 127,
    whyJoin:
      'Structured short bursts build a daily learning habit so career-switch milestones feel achievable instead of overwhelming.',
    milestones: [
      { id: 'm1', label: 'Silver', target: '5 lessons' },
      { id: 'm2', label: 'Gold', target: '12 lessons' },
      { id: 'm3', label: 'Platinum', target: '18 lessons' },
      { id: 'm4', label: 'Diamond', target: '25 lessons' },
    ],
    steps: [
      'Complete at least one lesson on 12 of the next 14 days.',
      'Use the same 25-minute focus window each day where possible.',
      'Check in with your sub-group thread once per week.',
    ],
    startsAt: '2026-04-01',
    endsAt: '2026-04-30',
    daysLeft: 16,
    optedIn: true,
    currentTierIndex: 1,
    groupsAtMilestoneTier: [
      [1, 4],
      [2],
      [3],
      [5],
    ],
    visualTier: 'gold',
    cardProgress: 0.55,
  },
  {
    id: 'ch-upcoming-enrolled-streak',
    name: '14-Day Consistency Streak',
    cohortId: 'enrolled',
    lifecycle: 'upcoming',
    groupIndex: 2,
    groupCount: 6,
    groupPlace: 4,
    approxGroupSize: 209,
    whyJoin:
      'Consistency beats intensity: a two-week streak wires a cue–routine–reward loop that supports any certificate path.',
    milestones: [
      { id: 'm1', label: 'Week 1', target: '7 days logged' },
      { id: 'm2', label: 'Week 2', target: '14 days logged' },
    ],
    steps: [
      'Log at least 20 minutes of learning on each streak day.',
      'Miss one “life happens” day without breaking the streak count.',
      'Share one takeaway in your group when you hit day 7.',
    ],
    startsAt: '2026-04-22',
    endsAt: '2026-05-06',
    daysLeft: undefined,
    optedIn: true,
    currentTierIndex: 0,
    groupsAtMilestoneTier: [
      [2, 4, 5, 6],
      [1, 3],
    ],
    visualTier: 'silver',
    cardProgress: 0,
  },
  {
    id: 'ch-upcoming-ai-hours',
    name: 'AI Foundations: 30 Study Hours',
    cohortId: 'ai',
    lifecycle: 'upcoming',
    groupIndex: 1,
    groupCount: 4,
    groupPlace: 1,
    approxGroupSize: 211,
    whyJoin:
      'Batching hours toward a single skill area reduces context switching and mirrors how pros deepen ML literacy.',
    milestones: [
      { id: 'm1', label: 'Silver', target: '10 hrs' },
      { id: 'm2', label: 'Gold', target: '20 hrs' },
      { id: 'm3', label: 'Platinum', target: '25 hrs' },
      { id: 'm4', label: 'Diamond', target: '30 hrs' },
    ],
    steps: [
      'Dedicate three 3-hour blocks per week on your calendar.',
      'Alternate video and practice items to reinforce concepts.',
      'Post your weekly focus topic in the cohort channel.',
    ],
    startsAt: '2026-04-18',
    endsAt: '2026-05-18',
    optedIn: true,
    currentTierIndex: 0,
    groupsAtMilestoneTier: [
      [1],
      [2],
      [3],
      [4],
    ],
    visualTier: 'platinum',
    cardProgress: 0.12,
  },
  {
    id: 'ch-completed-enrolled-relay',
    name: 'March Team Relay',
    cohortId: 'enrolled',
    lifecycle: 'completed',
    groupIndex: 4,
    groupCount: 5,
    groupPlace: 1,
    approxGroupSize: 251,
    whyJoin:
      'Teams that split modules by strength finish faster—this challenge practiced delegation and accountability.',
    milestones: [
      { id: 'm1', label: 'Relay leg 1', target: '25% course' },
      { id: 'm2', label: 'Relay leg 2', target: '50% course' },
      { id: 'm3', label: 'Finish', target: '100% course' },
    ],
    steps: [
      'Assign roles: lead learner, note-taker, timekeeper.',
      'Complete your leg before handing off in the group thread.',
      'Celebrate each leg in the cohort feed.',
    ],
    startsAt: '2026-03-01',
    endsAt: '2026-03-28',
    optedIn: true,
    outcome: {
      won: true,
      userRank: 2,
      shareoutPeerCount: 72,
    },
    currentTierIndex: 2,
    groupsAtMilestoneTier: [[], [], [1, 2, 3, 4, 5]],
    visualTier: 'diamond',
    cardProgress: 1,
    members: [
      { id: 'u1', displayName: 'Maya Chen', contribution: 420, highFiveCount: 18, isCurrentUser: false },
      { id: 'u2', displayName: 'You', contribution: 310, highFiveCount: 12, isCurrentUser: true },
      { id: 'u3', displayName: 'Ravi Patel', contribution: 298, highFiveCount: 9, isCurrentUser: false },
      { id: 'u4', displayName: 'Sam Okonkwo', contribution: 275, highFiveCount: 7, isCurrentUser: false },
      { id: 'u5', displayName: 'Zoe Martin', contribution: 260, highFiveCount: 5, isCurrentUser: false },
    ],
  },
];

function parseChallengeLocalDate(isoDate: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return new Date(isoDate);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Hero pill on slim challenge cards — days left, start date, or completion date.
 */
export function formatChallengeCardHeroLabel(challenge: CommunityChallenge): string {
  switch (challenge.lifecycle) {
    case 'active': {
      let days = challenge.daysLeft;
      if (days === undefined) {
        const end = parseChallengeLocalDate(challenge.endsAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
      }
      if (days <= 0) return 'Ends today';
      if (days === 1) return '1 day left';
      return `${days} days left`;
    }
    case 'upcoming': {
      const d = parseChallengeLocalDate(challenge.startsAt);
      const s = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `Starts ${s}`;
    }
    case 'completed': {
      const d = parseChallengeLocalDate(challenge.endsAt);
      const s = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `Completed ${s}`;
    }
  }
}

function ordinalPlace(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

export function formatGroupPlaceLine(
  c: Pick<CommunityChallenge, 'groupIndex' | 'groupCount' | 'groupPlace'>
): string {
  return `Group ${c.groupIndex} is in ${ordinalPlace(c.groupPlace)} place out of ${c.groupCount}`;
}

export function formatGroupsAtMilestoneLine(groupNumbers: number[]): string {
  if (groupNumbers.length === 0) return 'No groups at this tier yet.';
  const sorted = [...groupNumbers].sort((a, b) => a - b);
  return sorted.length === 1 ? `Group ${sorted[0]}` : `Groups ${sorted.join(', ')}`;
}

export function challengesForLifecycle(
  list: CommunityChallenge[],
  lifecycle: ChallengeLifecycle
): CommunityChallenge[] {
  return list.filter((x) => x.lifecycle === lifecycle);
}

/** Same cohort order as My Cohorts / Feed discover rail (`JOINED_FEED_COHORT_IDS`). */
export function sortChallengesByJoinedCohortOrder(challenges: CommunityChallenge[]): CommunityChallenge[] {
  const rank = (cohortId: FeedCohortId) => {
    const i = JOINED_FEED_COHORT_IDS.indexOf(cohortId);
    return i === -1 ? 999 : i;
  };
  return [...challenges].sort((a, b) => {
    const d = rank(a.cohortId) - rank(b.cohortId);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });
}
