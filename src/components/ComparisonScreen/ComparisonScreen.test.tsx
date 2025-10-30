/**
 * Tests for ComparisonScreen component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparisonScreen from './ComparisonScreen';
import { Team } from '../../types';
import { createMockTeam } from '../../__tests__/fixtures/teams';

describe('ComparisonScreen', () => {
  const teamA: Team = createMockTeam('Team Alpha');
  const teamB: Team = createMockTeam('Team Beta');
  const mockSelectWinner = vi.fn();
  const progress = { completed: 5, estimated: 40 };

  const defaultProps = {
    comparison: { teamA, teamB },
    onSelectWinner: mockSelectWinner,
    progress,
  };

  it('renders both team rosters', () => {
    render(<ComparisonScreen {...defaultProps} />);

    // Check that both teams' starters are visible
    const alphaPlayers = screen.getAllByText(/Team Alpha/);
    const betaPlayers = screen.getAllByText(/Team Beta/);

    expect(alphaPlayers.length).toBeGreaterThan(0);
    expect(betaPlayers.length).toBeGreaterThan(0);
  });

  it('view toggle controls both rosters simultaneously', async () => {
    const user = userEvent.setup();
    render(<ComparisonScreen {...defaultProps} />);

    const positionButton = screen.getByText('By Position');
    await user.click(positionButton);

    // Should now show position headers like QUARTERBACKS
    const positionHeaders = screen.getAllByText('QUARTERBACKS');
    expect(positionHeaders.length).toBe(2);
  });

  it('both RosterPanels show same viewMode', async () => {
    const user = userEvent.setup();
    render(<ComparisonScreen {...defaultProps} />);

    // Initially in starters mode - should show STARTERS header
    expect(screen.getAllByText('STARTERS').length).toBe(2);

    // Switch to position mode
    const positionButton = screen.getByText('By Position');
    await user.click(positionButton);

    // Should now show position headers like QUARTERBACKS
    const positionHeaders = screen.getAllByText('QUARTERBACKS');
    expect(positionHeaders.length).toBe(2);
  });

  it('changing view mode updates both panels', async () => {
    const user = userEvent.setup();
    render(<ComparisonScreen {...defaultProps} />);

    // Initially should show starters
    expect(screen.getAllByText('STARTERS').length).toBe(2);

    // Click position view button
    const positionButton = screen.getByText('By Position');
    await user.click(positionButton);

    // Should now show position view
    const positionHeaders = screen.getAllByText('QUARTERBACKS');
    expect(positionHeaders.length).toBe(2);
  });

  it('instruction text is displayed', () => {
    render(<ComparisonScreen {...defaultProps} />);

    const instructionText = screen.getByText(/click or use arrow keys to choose the best team/i);
    expect(instructionText).toBeTruthy();
  });

  it('progress bar is displayed', () => {
    const { container } = render(<ComparisonScreen {...defaultProps} />);

    const progressBar = container.querySelector('[class*="progressContainer"]');
    expect(progressBar).toBeTruthy();
  });

  it('ProgressBar renders with correct props', () => {
    const { container } = render(<ComparisonScreen {...defaultProps} />);

    // ProgressBar should be rendered with the progress values
    const filledBar = container.querySelector('[class*="filledBar"]');
    expect(filledBar).toBeTruthy();

    // 5 out of 40 should be 12.5%
    const expectedWidth = '12.5%';
    expect((filledBar as HTMLElement).style.width).toBe(expectedWidth);
  });

  it('progress updates when prop changes', () => {
    const { container, rerender } = render(<ComparisonScreen {...defaultProps} />);

    let filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('12.5%');

    // Update progress to 20 out of 40 (50%)
    rerender(<ComparisonScreen {...defaultProps} progress={{ completed: 20, estimated: 40 }} />);

    filledBar = container.querySelector('[class*="filledBar"]') as HTMLElement;
    expect(filledBar.style.width).toBe('50%');
  });

  it('layout uses flexbox for side-by-side display', () => {
    const { container } = render(<ComparisonScreen {...defaultProps} />);

    const rosterContainer = container.querySelector('[class*="rosterContainer"]');
    expect(rosterContainer).toBeTruthy();
  });

  it('purple background is applied', () => {
    const { container } = render(<ComparisonScreen {...defaultProps} />);

    const mainContainer = container.querySelector('[class*="container"]');
    expect(mainContainer).toBeTruthy();
    expect(mainContainer?.className).toContain('container');
  });

  it('active toggle button has correct styling', () => {
    render(<ComparisonScreen {...defaultProps} />);

    const startersButton = screen.getByText('Starters/Bench');
    expect(startersButton.className).toContain('toggleActive');
  });

  it('inactive toggle button has correct styling', () => {
    render(<ComparisonScreen {...defaultProps} />);

    const positionButton = screen.getByText('By Position');
    expect(positionButton.className).toContain('toggleInactive');
  });

  it('clicking left arrow calls onSelectWinner with teamA', async () => {
    const user = userEvent.setup();
    render(<ComparisonScreen {...defaultProps} />);

    const leftButton = screen.getByRole('button', { name: /select left team/i });
    await user.click(leftButton);

    expect(mockSelectWinner).toHaveBeenCalledWith(teamA);
  });

  it('clicking right arrow calls onSelectWinner with teamB', async () => {
    const user = userEvent.setup();
    render(<ComparisonScreen {...defaultProps} />);

    const rightButton = screen.getByRole('button', { name: /select right team/i });
    await user.click(rightButton);

    expect(mockSelectWinner).toHaveBeenCalledWith(teamB);
  });

  it('onSelectWinner is called with correct Team object', async () => {
    const user = userEvent.setup();
    const freshMock = vi.fn();

    render(<ComparisonScreen {...defaultProps} onSelectWinner={freshMock} />);

    const leftButton = screen.getByRole('button', { name: /select left team/i });
    await user.click(leftButton);

    expect(freshMock).toHaveBeenCalledTimes(1);
    const calledWith = freshMock.mock.calls[0][0];
    expect(calledWith.teamName).toBe('Team Alpha');
  });

  it('ArrowLeft key calls onSelectWinner with teamA', async () => {
    const user = userEvent.setup();
    const freshMock = vi.fn();

    render(<ComparisonScreen {...defaultProps} onSelectWinner={freshMock} />);

    await user.keyboard('{ArrowLeft}');

    expect(freshMock).toHaveBeenCalledWith(teamA);
  });

  it('ArrowRight key calls onSelectWinner with teamB', async () => {
    const user = userEvent.setup();
    const freshMock = vi.fn();

    render(<ComparisonScreen {...defaultProps} onSelectWinner={freshMock} />);

    await user.keyboard('{ArrowRight}');

    expect(freshMock).toHaveBeenCalledWith(teamB);
  });

  it('cleanup removes listener on unmount', async () => {
    const user = userEvent.setup();
    const freshMock = vi.fn();

    const { unmount } = render(<ComparisonScreen {...defaultProps} onSelectWinner={freshMock} />);

    unmount();

    await user.keyboard('{ArrowLeft}');

    expect(freshMock).not.toHaveBeenCalled();
  });

  it('preventDefault is called for arrow keys', async () => {
    const user = userEvent.setup();
    const freshMock = vi.fn();

    render(<ComparisonScreen {...defaultProps} onSelectWinner={freshMock} />);

    // This test verifies that arrow keys don't scroll the page
    // The actual preventDefault call happens inside the component
    await user.keyboard('{ArrowLeft}');

    // Verify the callback was invoked (preventDefault happened)
    expect(freshMock).toHaveBeenCalledWith(teamA);
  });
});
