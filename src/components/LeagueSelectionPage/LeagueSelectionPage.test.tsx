import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeagueSelectionPage from './LeagueSelectionPage';

describe('LeagueSelectionPage', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LeagueSelectionPage />
      </BrowserRouter>
    );
  };

  it('renders the page title', () => {
    renderComponent();
    expect(screen.getByText('Fantasy Ranker')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderComponent();
    expect(
      screen.getByText(/You'll compare teams head-to-head/i)
    ).toBeInTheDocument();
  });

  it('renders the "Choose Your League" heading', () => {
    renderComponent();
    expect(screen.getByText('Choose Your League')).toBeInTheDocument();
  });

  it('renders all three league buttons with correct text', () => {
    renderComponent();
    expect(screen.getByText('Go to Dub League')).toBeInTheDocument();
    expect(screen.getByText('Go to Pitt League')).toBeInTheDocument();
    expect(screen.getByText('Go to Men League')).toBeInTheDocument();
  });

  it('league buttons link to correct routes', () => {
    renderComponent();

    const dubLink = screen.getByText('Go to Dub League').closest('a');
    const pittLink = screen.getByText('Go to Pitt League').closest('a');
    const menLink = screen.getByText('Go to Men League').closest('a');

    expect(dubLink).toHaveAttribute('href', '/dub');
    expect(pittLink).toHaveAttribute('href', '/pitt');
    expect(menLink).toHaveAttribute('href', '/men');
  });
});
