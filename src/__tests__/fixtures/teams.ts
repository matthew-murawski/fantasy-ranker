/**
 * Test fixtures for creating mock teams with various configurations.
 */

import { Team, Player } from '../../types';

interface MockTeamConfig {
  numBench?: number;
  numIR?: number;
  positions?: string[];
}

/**
 * Creates a mock team with customizable configuration.
 */
export function createMockTeam(name: string, config: MockTeamConfig = {}): Team {
  const { numBench = 3, numIR = 0 } = config;

  // Create 9 starters (required positions)
  const starters: Player[] = [
    { playerName: `${name} QB1`, position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} RB1`, position: 'RB', nflTeam: 'SF', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} RB2`, position: 'RB', nflTeam: 'DAL', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} WR1`, position: 'WR', nflTeam: 'MIA', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} WR2`, position: 'WR', nflTeam: 'BUF', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} TE1`, position: 'TE', nflTeam: 'KC', rosterSlot: 'TE', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} FLEX`, position: 'RB', nflTeam: 'GB', rosterSlot: 'RB/WR/TE', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} DST`, position: 'D/ST', nflTeam: 'SF', rosterSlot: 'D/ST', injuryStatus: 'ACTIVE', isIR: false },
    { playerName: `${name} K1`, position: 'K', nflTeam: 'BAL', rosterSlot: 'K', injuryStatus: 'ACTIVE', isIR: false },
  ];

  // Create bench players
  const bench: Player[] = [];
  for (let i = 0; i < numBench; i++) {
    const positions = ['QB', 'RB', 'WR', 'TE'];
    const pos = positions[i % positions.length];
    bench.push({
      playerName: `${name} Bench ${pos}${Math.floor(i / positions.length) + 1}`,
      position: pos,
      nflTeam: 'NYJ',
      rosterSlot: 'BE',
      injuryStatus: 'ACTIVE',
      isIR: false,
    });
  }

  // Create IR players
  const ir: Player[] = [];
  for (let i = 0; i < numIR; i++) {
    const positions = ['RB', 'WR', 'TE'];
    const pos = positions[i % positions.length];
    ir.push({
      playerName: `${name} IR ${pos}${i + 1}`,
      position: pos,
      nflTeam: 'DEN',
      rosterSlot: 'BE',
      injuryStatus: 'INJURY_RESERVE',
      isIR: true,
    });
  }

  return {
    teamName: name,
    players: [...starters, ...bench, ...ir],
    starters,
    bench,
    ir,
  };
}

/**
 * Full roster team: 9 starters + 5 bench + 2 IR
 */
export const FULL_ROSTER_TEAM: Team = createMockTeam('Full Team', {
  numBench: 5,
  numIR: 2,
});

/**
 * Minimal team: 9 starters only
 */
export const MINIMAL_TEAM: Team = createMockTeam('Minimal Team', {
  numBench: 0,
  numIR: 0,
});

/**
 * IR heavy team: 9 starters + 5 IR
 */
export const IR_HEAVY_TEAM: Team = createMockTeam('IR Heavy Team', {
  numBench: 0,
  numIR: 5,
});
