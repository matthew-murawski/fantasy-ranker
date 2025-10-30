/**
 * Basic visual/accessibility checks.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparisonScreen from '../../components/ComparisonScreen';
import { createMockTeam } from '../fixtures/teams';

import fs from 'fs';
import path from 'path';

describe('Visual/Accessibility', () => {
  it('theme CSS defines required variables', () => {
    const themePath = path.resolve(__dirname, '../../styles/theme.css');
    const css = fs.readFileSync(themePath, 'utf-8');
    expect(css).toContain('--color-bg-primary: #0f1419');
    expect(css).toContain('--color-bg-secondary: #1e2128');
    expect(css).toContain('--color-text-primary: #e8eaed');
    expect(css).toContain('--color-accent: #00d4aa');
  });

  it('arrow buttons and toggles have aria-labels and are focusable', async () => {
    const user = userEvent.setup();
    const teamA = createMockTeam('A');
    const teamB = createMockTeam('B');
    const onSelect = () => {};
    render(
      <ComparisonScreen
        comparison={{ teamA, teamB }}
        onSelectWinner={onSelect}
        progress={{ completed: 0, estimated: 10 }}
      />
    );

    // Arrow buttons present with aria-labels
    const left = screen.getByRole('button', { name: /select left team/i });
    const right = screen.getByRole('button', { name: /select right team/i });
    expect(left).toBeInTheDocument();
    expect(right).toBeInTheDocument();

    // Toggles with aria labels
    const startersToggle = screen.getByRole('button', { name: /show starters and bench/i });
    const positionToggle = screen.getByRole('button', { name: /show roster by position/i });
    expect(startersToggle).toBeInTheDocument();
    expect(positionToggle).toBeInTheDocument();

    // Keyboard navigation tabs through buttons
    await user.tab();
    expect(document.activeElement?.tagName.toLowerCase()).toBe('button');
    await user.tab();
    expect(document.activeElement?.tagName.toLowerCase()).toBe('button');
  });
});
