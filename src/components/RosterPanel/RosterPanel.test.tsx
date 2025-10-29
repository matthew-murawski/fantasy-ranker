import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RosterPanel from './RosterPanel';
import { Team, Player } from '../../types';

describe('RosterPanel', () => {
  function createTestTeam(): Team {
    const starters: Player[] = [
      { playerName: 'QB1', position: 'QB', nflTeam: 'KC', rosterSlot: 'QB', injuryStatus: 'ACTIVE', isIR: false },
      { playerName: 'RB1', position: 'RB', nflTeam: 'SF', rosterSlot: 'RB', injuryStatus: 'ACTIVE', isIR: false },
    ];

    const bench: Player[] = [
      { playerName: 'Bench QB', position: 'QB', nflTeam: 'NYJ', rosterSlot: 'BE', injuryStatus: 'ACTIVE', isIR: false },
    ];

    return {
      teamName: 'Test Team',
      players: [...starters, ...bench],
      starters,
      bench,
      ir: [],
    };
  }

  describe('view rendering', () => {
    it('renders RosterList when viewMode is starters', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      // RosterList shows STARTERS header
      expect(screen.getByText('STARTERS')).toBeInTheDocument();
    });

    it('renders PositionGroupedView when viewMode is position', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="position" onViewModeChange={onViewModeChange} />
      );

      // PositionGroupedView shows QUARTERBACKS header
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
    });
  });

  describe('toggle buttons', () => {
    it('renders toggle buttons', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      expect(screen.getByText('Starters/Bench')).toBeInTheDocument();
      expect(screen.getByText('By Position')).toBeInTheDocument();
    });

    it('active button has correct styling', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      const startersButton = screen.getByText('Starters/Bench');
      const positionButton = screen.getByText('By Position');

      // Active button should be disabled
      expect(startersButton).toBeDisabled();
      expect(positionButton).not.toBeDisabled();
    });
  });

  describe('button interactions', () => {
    it('clicking inactive button calls onViewModeChange', async () => {
      const user = userEvent.setup();
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      const positionButton = screen.getByText('By Position');
      await user.click(positionButton);

      expect(onViewModeChange).toHaveBeenCalledWith('position');
    });

    it('active button does not call onViewModeChange when clicked', async () => {
      const user = userEvent.setup();
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      const startersButton = screen.getByText('Starters/Bench');
      await user.click(startersButton);

      expect(onViewModeChange).not.toHaveBeenCalled();
    });

    it('switches view mode correctly', async () => {
      const user = userEvent.setup();
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      const { rerender } = render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      // Click to position view
      const positionButton = screen.getByText('By Position');
      await user.click(positionButton);

      expect(onViewModeChange).toHaveBeenCalledWith('position');

      // Simulate parent component updating viewMode
      rerender(
        <RosterPanel team={team} viewMode="position" onViewModeChange={onViewModeChange} />
      );

      // Now should show position view
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();

      // Click back to starters
      const startersButton = screen.getByText('Starters/Bench');
      await user.click(startersButton);

      expect(onViewModeChange).toHaveBeenCalledWith('starters');
    });
  });

  describe('showViewToggle prop', () => {
    it('hides toggle when showViewToggle is false', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel
          team={team}
          viewMode="starters"
          onViewModeChange={onViewModeChange}
          showViewToggle={false}
        />
      );

      expect(screen.queryByText('Starters/Bench')).not.toBeInTheDocument();
      expect(screen.queryByText('By Position')).not.toBeInTheDocument();
    });

    it('shows toggle by default', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      expect(screen.getByText('Starters/Bench')).toBeInTheDocument();
      expect(screen.getByText('By Position')).toBeInTheDocument();
    });
  });

  describe('component integration', () => {
    it('passes correct props to child components', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      // RosterList should receive the team and display it
      expect(screen.getByText(/QB1/)).toBeInTheDocument();
      expect(screen.getByText(/Bench QB/)).toBeInTheDocument();
    });

    it('both roster panels show same viewMode', () => {
      const team = createTestTeam();
      const onViewModeChange = vi.fn();

      const { rerender } = render(
        <RosterPanel team={team} viewMode="starters" onViewModeChange={onViewModeChange} />
      );

      // Should show starters view
      expect(screen.getByText('STARTERS')).toBeInTheDocument();

      rerender(
        <RosterPanel team={team} viewMode="position" onViewModeChange={onViewModeChange} />
      );

      // Should show position view
      expect(screen.getByText('QUARTERBACKS')).toBeInTheDocument();
      expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
    });
  });
});
