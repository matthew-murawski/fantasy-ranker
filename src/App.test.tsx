import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders Fantasy Football Ranker heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /fantasy football ranker/i });
    expect(heading).toBeInTheDocument();
  });
});
