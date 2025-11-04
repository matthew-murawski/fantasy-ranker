import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';
import { mockLeagueData } from './test-utils';

// Mock the data service
vi.mock('./services/dataService', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    loadLeagueData: vi.fn(),
  };
});

import { loadLeagueData } from './services/dataService';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows league selection page at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/choose your league/i)).toBeInTheDocument();
    expect(screen.getByText('Go to Dub League')).toBeInTheDocument();
    expect(screen.getByText('Go to Pitt League')).toBeInTheDocument();
    expect(screen.getByText('Go to Men League')).toBeInTheDocument();
    expect(loadLeagueData).not.toHaveBeenCalled();
  });

  it('shows league-specific landing page at league route', () => {
    render(
      <MemoryRouter initialEntries={['/dub']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /dub fantasy ranker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(loadLeagueData).not.toHaveBeenCalled();
  });

  it('redirects to root for invalid league parameter', () => {
    render(
      <MemoryRouter initialEntries={['/invalid']}>
        <App />
      </MemoryRouter>
    );
    // Should redirect to league selection page
    expect(screen.getByText(/choose your league/i)).toBeInTheDocument();
  });

  it('loads Dub League data after entering name', async () => {
    const user = userEvent.setup();
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(
      <MemoryRouter initialEntries={['/dub']}>
        <App />
      </MemoryRouter>
    );

    // Click START button
    await user.click(screen.getByRole('button', { name: /start/i }));

    // Should show name input
    const nameInput = await screen.findByRole('textbox', { name: /enter your name/i });
    await user.type(nameInput, 'TestUser');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Should render comparison instruction after data loads
    expect(
      await screen.findByText(/click or use arrow keys to choose the best team/i)
    ).toBeInTheDocument();

    // Verify loadLeagueData called with 'dub'
    expect(loadLeagueData).toHaveBeenCalledWith('dub');
  });

  it('loads Pitt League data when at /pitt route', async () => {
    const user = userEvent.setup();
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(
      <MemoryRouter initialEntries={['/pitt']}>
        <App />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /start/i }));

    const nameInput = await screen.findByRole('textbox', { name: /enter your name/i });
    await user.type(nameInput, 'TestUser');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(loadLeagueData).toHaveBeenCalledWith('pitt');
    });
  });

  it('loads Men League data when at /men route', async () => {
    const user = userEvent.setup();
    const teams = mockLeagueData();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(teams);

    render(
      <MemoryRouter initialEntries={['/men']}>
        <App />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /start/i }));

    const nameInput = await screen.findByRole('textbox', { name: /enter your name/i });
    await user.type(nameInput, 'TestUser');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(loadLeagueData).toHaveBeenCalledWith('men');
    });
  });

  it('shows error message when loading fails', async () => {
    const user = userEvent.setup();
    (loadLeagueData as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network fail')
    );

    render(
      <MemoryRouter initialEntries={['/dub']}>
        <App />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /start/i }));

    const nameInput = await screen.findByRole('textbox', { name: /enter your name/i });
    await user.type(nameInput, 'TestUser');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      expect(screen.getByText(/network fail/i)).toBeInTheDocument();
    });
  });
});
