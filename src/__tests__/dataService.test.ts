import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadLeagueData, getTeamByName, validateRosterData } from '../services/dataService';
import { Team, Player } from '../types';
import * as XLSX from 'xlsx';

describe('dataService', () => {
  describe('loadLeagueData', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      vi.restoreAllMocks();
    });

    it('loads league data successfully', async () => {
      // Create mock Excel data
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Patrick Mahomes', 'QB', 'KC', 'QB', 'ACTIVE'],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      // Mock fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => buffer,
      }) as any;

      const teams = await loadLeagueData('dub');

      expect(teams).toBeDefined();
      expect(Array.isArray(teams)).toBe(true);
      // Path varies due to Vite asset resolution; ensure filename is included
      expect((fetch as any).mock.calls[0][0]).toContain('roster_dub.xlsx');
    });

    it('handles file not found error', async () => {
      // Mock fetch to return 404
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as any;

      await expect(loadLeagueData('nonexistent')).rejects.toThrow('Failed to load league data');
    });

    it('calls fetch with correct file path', async () => {
      const data = [
        ['Team Name', 'Player Name', 'Position', 'NFL Team', 'Roster Slot', 'Injury Status'],
        ['Team A', 'Player', 'QB', 'KC', 'QB', 'ACTIVE'],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => buffer,
      }) as any;

      await loadLeagueData('test-league');

      const calledWith = (fetch as any).mock.calls[0][0];
      expect(calledWith).toContain('roster_test-league.xlsx');
    });
  });

  describe('getTeamByName', () => {
    const teams: Team[] = [
      {
        teamName: 'Team A',
        players: [],
        starters: [],
        bench: [],
        ir: [],
      },
      {
        teamName: 'Team B',
        players: [],
        starters: [],
        bench: [],
        ir: [],
      },
    ];

    it('finds team by name', () => {
      const result = getTeamByName(teams, 'Team A');
      expect(result).toBeDefined();
      expect(result?.teamName).toBe('Team A');
    });

    it('returns undefined for non-existent team', () => {
      const result = getTeamByName(teams, 'Team C');
      expect(result).toBeUndefined();
    });
  });

  describe('validateRosterData', () => {
    function createValidTeam(name: string): Team {
      const starters: Player[] = [
        { playerName: 'QB1', position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'RB1', position: 'RB', nflTeam: 'SF', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'RB2', position: 'RB', nflTeam: 'DAL', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'WR1', position: 'WR', nflTeam: 'MIA', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'WR2', position: 'WR', nflTeam: 'BUF', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'TE1', position: 'TE', nflTeam: 'KC', rosterSlot: 'TE', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'FLEX1', position: 'RB', nflTeam: 'GB', rosterSlot: 'RB/WR/TE', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'K1', position: 'K', nflTeam: 'BAL', rosterSlot: 'K', injuryStatus: 'ACTIVE', isIR: false },
        { playerName: 'DST1', position: 'D/ST', nflTeam: 'SF', rosterSlot: 'D/ST', injuryStatus: 'ACTIVE', isIR: false },
      ];

      const bench: Player[] = [
        { playerName: 'Bench1', position: 'RB', nflTeam: 'NYJ', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
      ];

      return {
        teamName: name,
        players: [...starters, ...bench],
        starters,
        bench,
        ir: [],
      };
    }

    it('validates correct roster structure', () => {
      const teams = [createValidTeam('Team A'), createValidTeam('Team B')];
      expect(validateRosterData(teams)).toBe(true);
    });

    it('throws error for empty teams array', () => {
      expect(() => validateRosterData([])).toThrow('No teams found');
    });

    it('throws error for team with no starters', () => {
      const team: Team = {
        teamName: 'Bad Team',
        players: [],
        starters: [],
        bench: [],
        ir: [],
      };

      expect(() => validateRosterData([team])).toThrow('has no starters');
    });

    it('throws error for team with wrong number of starters', () => {
      const team = createValidTeam('Team A');
      team.starters = team.starters.slice(0, 5); // Only 5 starters instead of 9

      expect(() => validateRosterData([team])).toThrow('has 5 starters (expected 9)');
    });

    it('throws error for missing position', () => {
      const team = createValidTeam('Team A');
      // Replace one RB with another QB
      team.starters[1] = {
        playerName: 'QB2',
        position: 'QB',
        nflTeam: 'BUF',
        rosterSlot: 'QB',
        injuryStatus: 'ACTIVE',
        isIR: false,
      };

      expect(() => validateRosterData([team])).toThrow('has 2 QB starters (expected 1)');
    });

    it('throws error for invalid roster slot', () => {
      const team = createValidTeam('Team A');
      team.players.push({
        playerName: 'Invalid',
        position: 'RB',
        nflTeam: 'KC',
        rosterSlot: 'INVALID_SLOT',
        injuryStatus: 'ACTIVE',
        isIR: false,
      });

      expect(() => validateRosterData([team])).toThrow('invalid roster slot');
    });
  });
});
