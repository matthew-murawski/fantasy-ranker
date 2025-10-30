/**
 * Tests for LandingPage component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from './LandingPage';

describe('LandingPage', () => {
  it('renders title and start button', () => {
    const onStart = vi.fn();
    render(<LandingPage onStart={onStart} />);

    expect(screen.getByRole('heading', { name: /dub fantasy ranker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('invokes onStart when clicking the button', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<LandingPage onStart={onStart} />);

    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

