/**
 * Tests for TeamRankingCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamRankingCard from './TeamRankingCard';
import { createMockTeam } from '../../__tests__/fixtures/teams';

describe('TeamRankingCard', () => {
  const team = createMockTeam('Team Test');
  const onToggle = vi.fn();

  it('renders rank and team name', () => {
    render(<TeamRankingCard team={team} rank={1} isExpanded={false} onToggle={onToggle} />);
    expect(screen.getByText(/^1\./)).toBeInTheDocument();
    expect(screen.getByText('Team Test')).toBeInTheDocument();
  });

  it('not expanded by default', () => {
    render(<TeamRankingCard team={team} rank={2} isExpanded={false} onToggle={onToggle} />);
    // Should not show a section header like STARTERS (from RosterList) when collapsed
    expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
  });

  it('clicking card calls onToggle', async () => {
    const user = userEvent.setup();
    render(<TeamRankingCard team={team} rank={3} isExpanded={false} onToggle={onToggle} />);

    const card = screen.getByRole('button');
    await user.click(card);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('when expanded, roster is visible', () => {
    render(<TeamRankingCard team={team} rank={4} isExpanded={true} onToggle={onToggle} />);
    expect(screen.getByText('STARTERS')).toBeInTheDocument();
    expect(screen.getByText('BENCH')).toBeInTheDocument();
  });

  it('when collapsed, roster is hidden', () => {
    render(<TeamRankingCard team={team} rank={5} isExpanded={false} onToggle={onToggle} />);
    expect(screen.queryByText('STARTERS')).not.toBeInTheDocument();
    expect(screen.queryByText('BENCH')).not.toBeInTheDocument();
  });
});

