import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PositionGroupedView from './PositionGroupedView';
import { Team, Player } from '../../types';

describe('PositionGroupedView', () => {
  /**
   * Creates a team with multiple players per position, mix of starters/bench/IR.
   */
  function createMixedTeam(): Team {
    const players: Player[] = [
      // Starters
      { playerName: 'Starting QB', position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'Starting RB1', position: 'RB', nflTeam: 'SF', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'Starting WR', position: 'WR', nflTeam: 'MIA', rosterSlot: 'WR', injuryStatus: 'ACTIVE', isIR: false },
      // Bench
      { playerName: 'Bench QB', position: 'QB', nflTeam: 'NYJ', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'Bench RB', position: 'RB', nflTeam: 'DAL', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
      // IR
      { playerName: 'IR RB', position: 'RB', nflTeam: 'DEN', rosterSlot: 'RB', injuryStatus: 'INJURY_RESERVE', isIR: true },
      { playerName: 'IR WR', position: 'WR', nflTeam: 'ATL', rosterSlot: 'WR', injuryStatus: 'INJURY_RESERVE', isIR: true },
    ];

    const starters = players.filter(p => p.rosterSlot !== 'BE' && !p.isIR);
    const bench = players.filter(p => p.rosterSlot === 'BE' && !p.isIR);
    const ir = players.filter(p => p.isIR);

    return {
      teamName: 'Test Team',
      players,
      starters,
      bench,
      ir,
    };
  }

  describe('position headers', () => {
    it('renders all position headers with full names', () => {
      const team = createMixedTeam();
      render(<PositionGroupedView team={team} />);

      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
      expect(screen.getByText('RUNNING BACKS')).toBeInTheDocument();
      expect(screen.getByText('WIDE RECEIVERS')).toBeInTheDocument();
    });

    it('uses full position names not abbreviations', () => {
      const team = createMixedTeam();
      render(<PositionGroupedView team={team} />);

      // Should show full names for section headers (not abbreviations)
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
      expect(screen.getByText('RUNNING BACKS')).toBeInTheDocument();
      expect(screen.getByText('WIDE RECEIVERS')).toBeInTheDocument();

      // Note: Abbreviations like QB, RB, WR will appear in position badges,
      // but not as section headers
    });

    it('keeps D/ST as is', () => {
      const team: Team = {
        teamName: 'Test',
        players: [
          { playerName: 'Defense', position: 'D/ST', nflTeam: 'SF', rosterSlot: 'D/ST', injuryStatus: 'ACTIVE', isIR: false },
        ],
        starters: [
          { playerName: 'Defense', position: 'D/ST', nflTeam: 'SF', rosterSlot: 'D/ST', injuryStatus: 'ACTIVE', isIR: false },
        ],
        bench: [],
        ir: [],
      };

      render(<PositionGroupedView team={team} />);
      const dstElements = screen.getAllByText('D/ST');
      expect(dstElements.length).toBeGreaterThan(0);
    });
  });

  describe('player grouping', () => {
    it('groups all players by position', () => {
      const team = createMixedTeam();
      render(<PositionGroupedView team={team} />);

      // All QBs should be together
      expect(screen.getByText(/Starting QB/)).toBeInTheDocument();
      expect(screen.getByText(/Bench QB/)).toBeInTheDocument();

      // All RBs should be together (including IR)
      expect(screen.getByText(/Starting RB1/)).toBeInTheDocument();
      expect(screen.getByText(/Bench RB/)).toBeInTheDocument();
      expect(screen.getByText(/IR RB/)).toBeInTheDocument();
    });

    it('shows starters and bench together', () => {
      const team = createMixedTeam();
      render(<PositionGroupedView team={team} />);

      // QBs section should have both starter and bench
      const qbSection = screen.getByText('QUARTERBACKS').parentElement!;
      expect(qbSection.textContent).toContain('Starting QB');
      expect(qbSection.textContent).toContain('Bench QB');
    });
  });

  describe('IR indicator', () => {
    it('shows (IR) indicator for IR players', () => {
      const team = createMixedTeam();
      const { container } = render(<PositionGroupedView team={team} />);

      // IR players should show (IR) indicator - check the parent card element
      const irRBElement = screen.getByText(/IR RB/);
      const irRBCard = irRBElement.closest('div');
      expect(irRBCard?.textContent).toContain('(IR)');

      const irWRElement = screen.getByText(/IR WR/);
      const irWRCard = irWRElement.closest('div');
      expect(irWRCard?.textContent).toContain('(IR)');
    });

    it('does not show (IR) for non-IR players', () => {
      const team = createMixedTeam();
      const { container } = render(<PositionGroupedView team={team} />);

      const startingQBElement = screen.getByText(/Starting QB/);
      const startingQBCard = startingQBElement.closest('div');
      expect(startingQBCard?.textContent).not.toContain('(IR)');
    });
  });

  describe('position ordering', () => {
    it('displays positions in correct order', () => {
      const team = createMixedTeam();
      const { container } = render(<PositionGroupedView team={team} />);

      const text = container.textContent || '';

      // Find indices of position headers
      const qbIndex = text.indexOf('QUARTERBACKS');
      const rbIndex = text.indexOf('RUNNING BACKS');
      const wrIndex = text.indexOf('WIDE RECEIVERS');

      // Verify order: QB before RB before WR
      expect(qbIndex).toBeLessThan(rbIndex);
      expect(rbIndex).toBeLessThan(wrIndex);
    });
  });

  describe('empty positions', () => {
    it('does not render sections for empty positions', () => {
      const team: Team = {
        teamName: 'Minimal Team',
        players: [
          { playerName: 'QB Only', position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
        ],
        starters: [
          { playerName: 'QB Only', position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
        ],
        bench: [],
        ir: [],
      };

      render(<PositionGroupedView team={team} />);

      // Should show QB
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();

      // Should NOT show other positions
      expect(screen.queryByText('RUNNING BACKS')).not.toBeInTheDocument();
      expect(screen.queryByText('WIDE RECEIVERS')).not.toBeInTheDocument();
      expect(screen.queryByText('TIGHT ENDS')).not.toBeInTheDocument();
    });
  });

  describe('PlayerCard integration', () => {
    it('passes showIRIndicator prop to PlayerCards', () => {
      const team = createMixedTeam();
      render(<PositionGroupedView team={team} />);

      // IR players should have indicator - check the parent card element
      const irRBElement = screen.getByText(/IR RB/);
      const irRBCard = irRBElement.closest('div');
      expect(irRBCard?.textContent).toContain('(IR)');
    });

    it('uses position-group display format', () => {
      const team = createMixedTeam();
      render(<PositionGroupedView team={team} />);

      // Position-group format should not have pipe separator
      const container = screen.getByText(/Starting QB/).closest('div');
      expect(container?.textContent).not.toContain('|');
    });
  });
});
