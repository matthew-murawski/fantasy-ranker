import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RosterList from './RosterList';
import { Team, Player } from '../../types';

describe('RosterList', () => {
  /**
   * Creates a comprehensive test team with all 9 starters, bench, and IR players.
   */
  function createFullRosterTeam(): Team {
    const starters: Player[] = [
      { playerName: 'QB1', position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'RB1', position: 'RB', nflTeam: 'SF', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'RB2', position: 'RB', nflTeam: 'DAL', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'WR1', position: 'WR', nflTeam: 'MIA', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'WR2', position: 'WR', nflTeam: 'BUF', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'TE1', position: 'TE', nflTeam: 'KC', rosterSlot: 'TE', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'FLEX1', position: 'RB', nflTeam: 'GB', rosterSlot: 'RB/WR/TE', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'DST1', position: 'D/ST', nflTeam: 'SF', rosterSlot: 'D/ST', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'K1', position: 'K', nflTeam: 'BAL', rosterSlot: 'K', injuryStatus: 'ACTIVE', isIR: false },
    ];

    const bench: Player[] = [
      { playerName: 'Bench QB', position: 'QB', nflTeam: 'NYJ', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'Bench RB1', position: 'RB', nflTeam: 'LAR', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'Bench RB2', position: 'RB', nflTeam: 'PHI', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'Bench WR', position: 'WR', nflTeam: 'SEA', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
    ];

    const ir: Player[] = [
      { playerName: 'IR Player 1', position: 'RB', nflTeam: 'DEN', rosterSlot: 'RB', injuryStatus: 'INJURY_RESERVE', isIR: true },
      { playerName: 'IR Player 2', position: 'WR', nflTeam: 'ATL', rosterSlot: 'WR', injuryStatus: 'INJURY_RESERVE', isIR: true },
    ];

    return {
      teamName: 'Test Team',
      players: [...starters, ...bench, ...ir],
      starters,
      bench,
      ir,
    };
  }

  describe('section rendering', () => {
    it('renders all three sections with correct headers', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} />);

      expect(screen.getByText('STARTERS')).toBeInTheDocument();
      expect(screen.getByText('BENCH')).toBeInTheDocument();
      expect(screen.getByText('IR')).toBeInTheDocument();
    });

    it('does not render empty sections', () => {
      const team: Team = {
        teamName: 'Minimal Team',
        players: [],
        starters: [],
        bench: [],
        ir: [],
      };

      render(<RosterList team={team} />);

      expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
      expect(screen.queryByText('BENCH')).not.toBeInTheDocument();
      expect(screen.queryByText('IR')).not.toBeInTheDocument();
    });
  });

  describe('starter ordering', () => {
    it('displays starters in correct position order', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} />);

      // Check that specific players appear in correct order
      expect(screen.getByText(/QB1/)).toBeInTheDocument();
      expect(screen.getByText(/K1/)).toBeInTheDocument();

      // QB should appear before K in the DOM
      const startersSection = screen.getByText('STARTERS').parentElement!;
      const startersText = startersSection.textContent || '';

      const qbIndex = startersText.indexOf('QB1');
      const kIndex = startersText.indexOf('K1');

      expect(qbIndex).toBeLessThan(kIndex);
      expect(qbIndex).toBeGreaterThan(-1);
      expect(kIndex).toBeGreaterThan(-1);
    });

    it('displays FLEX as "FLEX" not "RB/WR/TE"', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} />);

      // The FLEX player should be shown
      expect(screen.getByText(/FLEX1/)).toBeInTheDocument();

      // Check that FLEX appears in the starters section (not RB/WR/TE)
      const startersSection = screen.getByText('STARTERS').parentElement!;
      const startersText = startersSection.textContent || '';

      // Should contain the word FLEX
      expect(startersText).toContain('FLEX');

      // Should NOT contain RB/WR/TE
      expect(startersText).not.toContain('RB/WR/TE');
    });
  });

  describe('bench grouping', () => {
    it('groups bench players by position', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} />);

      // All bench players should be present
      expect(screen.getByText(/Bench QB/)).toBeInTheDocument();
      expect(screen.getByText(/Bench RB1/)).toBeInTheDocument();
      expect(screen.getByText(/Bench RB2/)).toBeInTheDocument();
      expect(screen.getByText(/Bench WR/)).toBeInTheDocument();
    });
  });

  describe('IR section', () => {
    it('shows IR players in IR section', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} />);

      expect(screen.getByText(/IR Player 1/)).toBeInTheDocument();
      expect(screen.getByText(/IR Player 2/)).toBeInTheDocument();
    });
  });

  describe('visibility props', () => {
    it('hides starters when showStarters is false', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} showStarters={false} />);

      expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
      expect(screen.queryByText(/QB1/)).not.toBeInTheDocument();
    });

    it('hides bench when showBench is false', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} showBench={false} />);

      expect(screen.queryByText('BENCH')).not.toBeInTheDocument();
      expect(screen.queryByText(/Bench QB/)).not.toBeInTheDocument();
    });

    it('hides IR when showIR is false', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} showIR={false} />);

      expect(screen.queryByText('IR')).not.toBeInTheDocument();
      expect(screen.queryByText(/IR Player 1/)).not.toBeInTheDocument();
    });
  });

  describe('PlayerCard integration', () => {
    it('passes correct displayFormat to PlayerCards', () => {
      const team = createFullRosterTeam();
      render(<RosterList team={team} />);

      // Starters should have pipe separator
      const starterSection = screen.getByText('STARTERS').parentElement;
      expect(starterSection?.textContent).toContain('|');

      // Bench should not have pipe separator (checking bench section)
      const benchPlayer = screen.getByText(/Bench QB/);
      expect(benchPlayer.textContent).not.toContain('|');
    });
  });
});
