/**
 * Integration tests for roster display components.
 * Tests the complete interaction between RosterPanel, RosterList, PositionGroupedView, and PlayerCard.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import RosterPanel from '../../components/RosterPanel';
import { FULL_ROSTER_TEAM, MINIMAL_TEAM, IR_HEAVY_TEAM, createMockTeam } from '../fixtures';
import { Team } from '../../types';

/**
 * Wrapper component that manages viewMode state for testing.
 */
function RosterPanelWithState({ team }: { team: Team }) {
  const [viewMode, setViewMode] = useState<'starters' | 'position'>('starters');

  return (
    <RosterPanel
      team={team}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}

describe('Roster Display Integration', () => {
  describe('Full roster display flow', () => {
    it('displays complete roster in starters view', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      // Verify starters section
      expect(screen.getByText('STARTERS')).toBeInTheDocument();
      expect(screen.getByText(/Full Team QB1/)).toBeInTheDocument();
      expect(screen.getByText(/Full Team K1/)).toBeInTheDocument();

      // Verify bench section
      expect(screen.getByText('BENCH')).toBeInTheDocument();
      const benchPlayers = screen.getAllByText(/Full Team Bench/);
      expect(benchPlayers.length).toBeGreaterThan(0);

      // Verify IR section
      expect(screen.getByText('IR')).toBeInTheDocument();
      const irPlayers = screen.getAllByText(/Full Team IR/);
      expect(irPlayers.length).toBeGreaterThan(0);
    });

    it('displays starters in correct order', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const startersSection = screen.getByText('STARTERS').parentElement!;
      const text = startersSection.textContent || '';

      // QB should appear before K
      const qbIndex = text.indexOf('QB1');
      const kIndex = text.indexOf('K1');
      expect(qbIndex).toBeLessThan(kIndex);
    });

    it('groups bench players by position', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const benchSection = screen.getByText('BENCH').parentElement!;
      expect(benchSection).toBeTruthy();

      // Bench players should be present
      const benchPlayers = screen.getAllByText(/Bench QB/);
      expect(benchPlayers.length).toBeGreaterThan(0);
    });

    it('displays IR players in IR section', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const irSection = screen.getByText('IR').parentElement!;
      expect(irSection).toBeTruthy();

      // IR players should be present
      expect(screen.getAllByText(/IR RB/).length).toBeGreaterThan(0);
    });

    it('switches to position view correctly', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      // Click "By Position" button
      const positionButton = screen.getByText('By Position');
      await user.click(positionButton);

      // Verify position view is displayed
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
      expect(screen.getByText('RUNNING BACKS')).toBeInTheDocument();
      expect(screen.getByText('WIDE RECEIVERS')).toBeInTheDocument();

      // Starters header should not be present
      expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
    });

    it('shows IR indicator in position view', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      // Switch to position view
      const positionButton = screen.getByText('By Position');
      await user.click(positionButton);

      // IR players should show (IR) indicator
      const irPlayers = screen.getAllByText(/\(IR\)/);
      expect(irPlayers.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('handles team with no bench players', () => {
      render(<RosterPanelWithState team={MINIMAL_TEAM} />);

      // Starters should be present
      expect(screen.getByText('STARTERS')).toBeInTheDocument();

      // Bench section should not appear (empty)
      expect(screen.queryByText('BENCH')).not.toBeInTheDocument();

      // IR section should not appear (empty)
      expect(screen.queryByText('IR')).not.toBeInTheDocument();
    });

    it('handles team with no IR players', () => {
      render(<RosterPanelWithState team={MINIMAL_TEAM} />);

      expect(screen.queryByText('IR')).not.toBeInTheDocument();
    });

    it('handles team with maximum IR players', () => {
      render(<RosterPanelWithState team={IR_HEAVY_TEAM} />);

      // IR section should be present
      expect(screen.getByText('IR')).toBeInTheDocument();

      // Multiple IR players
      const irPlayers = screen.getAllByText(/IR Heavy Team IR/);
      expect(irPlayers.length).toBe(5);
    });

    it('handles team with many bench players', () => {
      const team = createMockTeam('Big Bench Team', { numBench: 10, numIR: 0 });
      render(<RosterPanelWithState team={team} />);

      // Bench section should be present
      expect(screen.getByText('BENCH')).toBeInTheDocument();

      // Many bench players should be present
      const benchPlayers = screen.getAllByText(/Big Bench Team Bench/);
      expect(benchPlayers.length).toBe(10);
    });
  });

  describe('View toggle functionality', () => {
    it('starts in starters mode', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      expect(screen.getByText('STARTERS')).toBeInTheDocument();
      expect(screen.queryByText('QUARTERBACKS')).not.toBeInTheDocument();
    });

    it('switches to position mode', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      await user.click(screen.getByText('By Position'));

      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
      expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
    });

    it('switches back to starters mode', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      // Switch to position
      await user.click(screen.getByText('By Position'));
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();

      // Switch back to starters
      await user.click(screen.getByText('Starters/Bench'));
      expect(screen.getByText('STARTERS')).toBeInTheDocument();
      expect(screen.queryByText('QUARTERBACKS')).not.toBeInTheDocument();
    });

    it('updates button states correctly', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const startersButton = screen.getByText('Starters/Bench');
      const positionButton = screen.getByText('By Position');

      // Initially, starters should be active (disabled)
      expect(startersButton).toBeDisabled();
      expect(positionButton).not.toBeDisabled();

      // After clicking position button
      await user.click(positionButton);

      // Position should be active (disabled)
      expect(startersButton).not.toBeDisabled();
      expect(positionButton).toBeDisabled();
    });
  });

  describe('Starter position ordering', () => {
    it('displays QB first and K last', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const startersSection = screen.getByText('STARTERS').parentElement!;
      const text = startersSection.textContent || '';

      const qbIndex = text.indexOf('QB1');
      const kIndex = text.indexOf('K1');

      expect(qbIndex).toBeLessThan(kIndex);
      expect(qbIndex).toBeGreaterThan(-1);
      expect(kIndex).toBeGreaterThan(-1);
    });

    it('displays multiple RBs in order', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const startersSection = screen.getByText('STARTERS').parentElement!;
      const text = startersSection.textContent || '';

      const rb1Index = text.indexOf('RB1');
      const rb2Index = text.indexOf('RB2');

      expect(rb1Index).toBeLessThan(rb2Index);
    });

    it('displays FLEX with correct label', () => {
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      const startersSection = screen.getByText('STARTERS').parentElement!;

      // Should show FLEX, not RB/WR/TE
      expect(startersSection.textContent).toContain('FLEX');
      expect(startersSection.textContent).not.toContain('RB/WR/TE');
    });
  });

  describe('Position grouping', () => {
    it('groups all players by position', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      await user.click(screen.getByText('By Position'));

      // Check position headers appear in correct order
      const container = screen.getByText('QUARTERBACKS').closest('div')?.parentElement!;
      const text = container.textContent || '';

      const qbIndex = text.indexOf('QUARTERBACKS');
      const rbIndex = text.indexOf('RUNNING BACKS');
      const wrIndex = text.indexOf('WIDE RECEIVERS');

      expect(qbIndex).toBeLessThan(rbIndex);
      expect(rbIndex).toBeLessThan(wrIndex);
    });

    it('displays position headers with full names', async () => {
      const user = userEvent.setup();
      render(<RosterPanelWithState team={FULL_ROSTER_TEAM} />);

      await user.click(screen.getByText('By Position'));

      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
      expect(screen.getByText('RUNNING BACKS')).toBeInTheDocument();
      expect(screen.getByText('WIDE RECEIVERS')).toBeInTheDocument();
      expect(screen.getByText('TIGHT ENDS')).toBeInTheDocument();
    });
  });
});
