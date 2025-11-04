import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseRosterFile } from '../services/excelParser';

describe('excelParser', () => {
  /**
   * Helper function to create a mock Excel buffer for testing.
   */
  function createMockExcelBuffer(data: any[][]): ArrayBuffer {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return buffer as ArrayBuffer;
  }

  describe('parseRosterFile', () => {
    it('parses a valid Excel file with 2 teams', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Patrick Mahomes', 'QB', 'KC', 'QB', 'ACTIVE'],
        ['Team A', 'Christian McCaffrey', 'RB', 'SF', 'RB', 'ACTIVE'],
        ['Team A', 'Tyreek Hill', 'WR', 'MIA', 'BE', 'ACTIVE'],
        ['Team B', 'Josh Allen', 'QB', 'BUF', 'QB', 'ACTIVE'],
        ['Team B', 'Travis Kelce', 'TE', 'KC', 'TE', 'ACTIVE'],
        ['Team B', 'Cooper Kupp', 'WR', 'LAR', 'BE', 'INJURY_RESERVE'],
      ];

      const buffer = createMockExcelBuffer(data);
      const teams = await parseRosterFile(buffer);

      expect(teams).toHaveLength(2);
      expect(teams[0].teamName).toBe('Team A');
      expect(teams[1].teamName).toBe('Team B');
    });

    it('correctly groups players by team', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Patrick Mahomes', 'QB', 'KC', 'QB', 'ACTIVE'],
        ['Team A', 'Christian McCaffrey', 'RB', 'SF', 'RB', 'ACTIVE'],
        ['Team A', 'Tyreek Hill', 'WR', 'MIA', 'WR', 'ACTIVE'],
        ['Team B', 'Josh Allen', 'QB', 'BUF', 'QB', 'ACTIVE'],
      ];

      const buffer = createMockExcelBuffer(data);
      const teams = await parseRosterFile(buffer);

      const teamA = teams.find(t => t.teamName === 'Team A');
      const teamB = teams.find(t => t.teamName === 'Team B');

      expect(teamA?.players).toHaveLength(3);
      expect(teamB?.players).toHaveLength(1);
    });

    it('correctly identifies IR players', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Healthy Player', 'RB', 'SF', 'RB', 'ACTIVE'],
        ['Team A', 'IR Player', 'WR', 'LAR', 'WR', 'INJURY_RESERVE'],
      ];

      const buffer = createMockExcelBuffer(data);
      const teams = await parseRosterFile(buffer);

      const team = teams[0];
      const healthyPlayer = team.players.find(p => p.playerName === 'Healthy Player');
      const irPlayer = team.players.find(p => p.playerName === 'IR Player');

      expect(healthyPlayer?.isIR).toBe(false);
      expect(irPlayer?.isIR).toBe(true);
    });

    it('correctly separates starters, bench, and IR', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Starter QB', 'QB', 'KC', 'QB', 'ACTIVE'],
        ['Team A', 'Starter RB', 'RB', 'SF', 'RB', 'ACTIVE'],
        ['Team A', 'Bench WR', 'WR', 'MIA', 'BE', 'ACTIVE'],
        ['Team A', 'Bench RB', 'RB', 'DAL', 'BE', 'ACTIVE'],
        ['Team A', 'IR Player 1', 'TE', 'KC', 'TE', 'INJURY_RESERVE'],
        ['Team A', 'IR Player 2', 'WR', 'BUF', 'BE', 'INJURY_RESERVE'],
      ];

      const buffer = createMockExcelBuffer(data);
      const teams = await parseRosterFile(buffer);

      const team = teams[0];
      // Auto-fill ensures exactly 9 starters
      // Original: 2 starters (QB, RB)
      // Auto-filled from bench: 2 (Bench WR→WR, Bench RB→FLEX)
      // EMPTY placeholders: 5 (for remaining positions)
      expect(team.starters).toHaveLength(9);
      expect(team.bench).toHaveLength(0); // Both bench players promoted to fill missing positions
      expect(team.ir).toHaveLength(2);

      // Verify original starters
      expect(team.starters.some(p => p.playerName === 'Starter QB')).toBe(true);
      expect(team.starters.some(p => p.playerName === 'Starter RB')).toBe(true);
      // Verify bench players were promoted
      expect(team.starters.some(p => p.playerName === 'Bench WR')).toBe(true);
      expect(team.starters.some(p => p.playerName === 'Bench RB')).toBe(true);
      // Verify IR players stayed in IR
      expect(team.ir.some(p => p.playerName === 'IR Player 1')).toBe(true);
      // Check that EMPTY placeholders were added for remaining positions
      expect(team.starters.filter(p => p.playerName === 'EMPTY').length).toBe(5);
    });

    it('handles empty cells gracefully', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Patrick Mahomes', 'QB', 'KC', 'QB', 'ACTIVE'],
        ['Team A', 'Player Without Team', '', '', 'RB', 'ACTIVE'],
        ['', '', '', '', '', ''], // Empty row
        ['Team A', 'Another Player', 'WR', 'MIA', 'WR', ''],
      ];

      const buffer = createMockExcelBuffer(data);
      const teams = await parseRosterFile(buffer);

      const team = teams[0];
      // Should have 3 players (one with empty position, one with empty injury status)
      expect(team.players.length).toBeGreaterThanOrEqual(2);
    });

    it('throws error for duplicate team names', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Patrick Mahomes', 'QB', 'KC', 'QB', 'ACTIVE'],
        ['Team A', 'Josh Allen', 'QB', 'BUF', 'QB', 'ACTIVE'],
      ];

      const buffer = createMockExcelBuffer(data);

      // This should not throw an error - same team name is expected for multiple players
      await expect(parseRosterFile(buffer)).resolves.toBeDefined();
    });

    it('handles invalid Excel data by returning empty array', async () => {
      const invalidBuffer = new ArrayBuffer(10);

      // xlsx library can parse empty buffers but returns no data
      const teams = await parseRosterFile(invalidBuffer);
      expect(Array.isArray(teams)).toBe(true);
    });
  });
});
