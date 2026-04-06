import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AuditPro title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Audit/i);
  expect(linkElement).toBeInTheDocument();
});
