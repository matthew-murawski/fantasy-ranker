/**
 * Test utilities for app-level tests.
 */

import * as XLSX from 'xlsx';
import { Team } from './types';
import { createMockTeam } from './__tests__/fixtures/teams';

/**
 * Returns an array of 12 mock teams with valid rosters.
 */
export function mockLeagueData(): Team[] {
  return Array.from({ length: 12 }, (_, i) => createMockTeam(`Team ${i + 1}`));
}

/**
 * Creates an Excel ArrayBuffer from Team[] data matching the expected schema.
 */
export function createRosterBufferFromTeams(teams: Team[]): ArrayBuffer {
  const rows: any[][] = [];
  // Header
  rows.push(['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status']);

  teams.forEach(team => {
    team.players.forEach(player => {
      rows.push([
        team.teamName,
        player.playerName,
        player.position,
        player.nflTeam,
        player.rosterSlot,
        player.injuryStatus,
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return buffer as ArrayBuffer;
}

/**
 * Mocks global fetch for loadLeagueData. When success=true, returns a Response-like
 * object with an ArrayBuffer of a valid roster file. Otherwise returns a 404-like object.
 */
export function setupMockFetch(success: boolean) {
  if (success) {
    const buffer = createRosterBufferFromTeams(mockLeagueData());
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => buffer,
    });
  } else {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
  }
}

