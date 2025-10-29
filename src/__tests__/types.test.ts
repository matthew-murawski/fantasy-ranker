import { describe, it, expect } from 'vitest';
import { Player, isStarter, isBench, isIR } from '../types';

describe('Type utility functions', () => {
  describe('isStarter', () => {
    it('returns true for a starter player (not BE, not IR)', () => {
      const player: Player = {
        playerName: 'Patrick Mahomes',
        position: 'QB',
        nflTeam: 'KC',
        rosterSlot: 'QB',
        injuryStatus: 'ACTIVE',
        isIR: false,
      };
      expect(isStarter(player)).toBe(true);
    });

    it('returns false for a bench player', () => {
      const player: Player = {
        playerName: 'Backup QB',
        position: 'QB',
        nflTeam: 'KC',
        rosterSlot: 'BE',
        injuryStatus: 'ACTIVE',
        isIR: false,
      };
      expect(isStarter(player)).toBe(false);
    });

    it('returns false for an IR player', () => {
      const player: Player = {
        playerName: 'Injured Player',
        position: 'RB',
        nflTeam: 'SF',
        rosterSlot: 'RB',
        injuryStatus: 'INJURY_RESERVE',
        isIR: true,
      };
      expect(isStarter(player)).toBe(false);
    });
  });

  describe('isBench', () => {
    it('returns true for a bench player (BE slot, not IR)', () => {
      const player: Player = {
        playerName: 'Bench Player',
        position: 'WR',
        nflTeam: 'DAL',
        rosterSlot: 'BE',
        injuryStatus: 'ACTIVE',
        isIR: false,
      };
      expect(isBench(player)).toBe(true);
    });

    it('returns false for a starter player', () => {
      const player: Player = {
        playerName: 'CeeDee Lamb',
        position: 'WR',
        nflTeam: 'DAL',
        rosterSlot: 'WR',
        injuryStatus: 'ACTIVE',
        isIR: false,
      };
      expect(isBench(player)).toBe(false);
    });

    it('returns false for an IR player even if roster slot is BE', () => {
      const player: Player = {
        playerName: 'Injured Bench',
        position: 'TE',
        nflTeam: 'MIA',
        rosterSlot: 'BE',
        injuryStatus: 'INJURY_RESERVE',
        isIR: true,
      };
      expect(isBench(player)).toBe(false);
    });
  });

  describe('isIR', () => {
    it('returns true for an IR player', () => {
      const player: Player = {
        playerName: 'IR Player',
        position: 'RB',
        nflTeam: 'BUF',
        rosterSlot: 'RB',
        injuryStatus: 'INJURY_RESERVE',
        isIR: true,
      };
      expect(isIR(player)).toBe(true);
    });

    it('returns false for a non-IR player', () => {
      const player: Player = {
        playerName: 'Healthy Player',
        position: 'QB',
        nflTeam: 'BUF',
        rosterSlot: 'QB',
        injuryStatus: 'ACTIVE',
        isIR: false,
      };
      expect(isIR(player)).toBe(false);
    });

    it('returns false for a questionable player', () => {
      const player: Player = {
        playerName: 'Questionable Player',
        position: 'WR',
        nflTeam: 'GB',
        rosterSlot: 'WR',
        injuryStatus: 'QUESTIONABLE',
        isIR: false,
      };
      expect(isIR(player)).toBe(false);
    });
  });
});
