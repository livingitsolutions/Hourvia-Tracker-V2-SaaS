import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { App } from '../src/App';
beforeEach(() => {
  window.location.hash = '#/dashboard';
});
it('shows an honest foundation without fabricated work or identity', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: 'A clear start.' }),
  ).toBeInTheDocument();
  expect(screen.getByText(/No activity available/)).toBeInTheDocument();
  expect(
    screen.getByText(/Authentication, tracking and billing are unavailable/),
  ).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it.each([
  'Login',
  'Tracker',
  'Projects',
  'DTR',
  'Timesheets',
  'Members',
  'Clients',
  'Billing',
])('renders %s as unavailable', (page) => {
  window.location.hash = '#/' + page.toLowerCase();
  render(<App />);
  expect(screen.getByRole('heading', { name: page })).toBeInTheDocument();
  expect(
    screen.getByText('NOT AVAILABLE IN THIS FOUNDATION'),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /unavailable/i })).toBeDisabled();
});
it('supports hash navigation and mobile navigation disclosure', () => {
  render(<App />);
  const toggle = screen.getByRole('button', { name: 'Open navigation' });
  fireEvent.click(toggle);
  expect(
    screen.getByRole('button', { name: 'Close navigation' }),
  ).toBeInTheDocument();
  window.location.hash = '#/tracker';
  fireEvent(window, new HashChangeEvent('hashchange'));
  expect(screen.getByRole('heading', { name: 'Tracker' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tracker' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
it('opens and closes information', () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'About this foundation' }),
  );
  expect(
    screen.getByRole('region', { name: 'About this foundation' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close information' }));
  expect(
    screen.queryByRole('region', { name: 'About this foundation' }),
  ).not.toBeInTheDocument();
});
