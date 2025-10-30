/**
 * Data service for loading and managing fantasy football roster data.
 * Handles fetching Excel files and validating roster structures.
 */

import { Team } from '../types';
import { parseRosterFile } from './excelParser';

function resolveRosterUrl(leagueName: string): string {
  // Use Vite asset URL for the real in-repo data files
  if (leagueName === 'dub') {
    return new URL('../../data/roster_dub.xlsx', import.meta.url).href;
  }
  if (leagueName === 'pitt') {
    return new URL('../../data/roster_pitt.xlsx', import.meta.url).href;
  }
  if (leagueName === 'men') {
    return new URL('../../data/roster_men.xlsx', import.meta.url).href;
  }
  // Fallback for tests; tests mock fetch so path content is irrelevant
  return `/data/roster_${leagueName}.xlsx`;
}

/**
 * Loads league data from an Excel file in the public directory.
 *
 * @param leagueName - Name of the league (e.g., 'dub' loads 'roster_dub.xlsx')
 * @returns Promise resolving to array of Team objects
 * @throws Error if file not found or parsing fails
 */
export async function loadLeagueData(leagueName: string): Promise<Team[]> {
  try {
    const fileName = `roster_${leagueName}.xlsx`;
    const assetUrl = resolveRosterUrl(leagueName);

    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error(`File not found: ${fileName} (status: ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const teams = await parseRosterFile(arrayBuffer);

    return teams;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load league data: ${error.message}`);
    }
    throw new Error('Failed to load league data: Unknown error');
  }
}

/**
 * Finds a team by name in the teams array.
 *
 * @param teams - Array of teams to search
 * @param teamName - Name of team to find
 * @returns Team object if found, undefined otherwise
 */
export function getTeamByName(teams: Team[], teamName: string): Team | undefined {
  return teams.find(team => team.teamName === teamName);
}

/**
 * Validates that roster data has correct structure.
 *
 * Each team must have:
 * - At least 1 starter
 * - Exactly 9 starters (1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX, 1 K, 1 D/ST)
 * - Valid roster slots
 *
 * @param teams - Array of teams to validate
 * @returns true if valid
 * @throws Error with details if validation fails
 */
export function validateRosterData(teams: Team[]): boolean {
  if (!teams || teams.length === 0) {
    throw new Error('Validation failed: No teams found in roster data');
  }

  for (const team of teams) {
    // Check for at least 1 starter
    if (team.starters.length === 0) {
      throw new Error(`Validation failed: Team "${team.teamName}" has no starters`);
    }

    // Check for exactly 9 starters
    if (team.starters.length !== 9) {
      throw new Error(
        `Validation failed: Team "${team.teamName}" has ${team.starters.length} starters (expected 9)`
      );
    }

    // Count positions in starters
    const positionCounts: Record<string, number> = {};
    for (const player of team.starters) {
      const slot = player.rosterSlot;
      positionCounts[slot] = (positionCounts[slot] || 0) + 1;
    }

    // Validate position counts
    const expectedPositions: Record<string, number> = {
      'QB': 1,
      'RB': 2,
      'WR': 2,
      'TE': 1,
      'RB/WR/TE': 1, // FLEX
      'K': 1,
      'D/ST': 1,
    };

    for (const [position, expectedCount] of Object.entries(expectedPositions)) {
      const actualCount = positionCounts[position] || 0;
      if (actualCount !== expectedCount) {
        throw new Error(
          `Validation failed: Team "${team.teamName}" has ${actualCount} ${position} starters (expected ${expectedCount})`
        );
      }
    }

    // Check for valid roster slots
    for (const player of team.players) {
      const validSlots = ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST', 'RB/WR/TE', 'BE', 'IR'];
      if (!validSlots.includes(player.rosterSlot)) {
        throw new Error(
          `Validation failed: Team "${team.teamName}" has player "${player.playerName}" with invalid roster slot "${player.rosterSlot}"`
        );
      }
    }
  }

  return true;
}
