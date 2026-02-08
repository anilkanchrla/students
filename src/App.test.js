import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login screen', () => {
  render(<App />);
  const linkElement = screen.getByText(/Mobile Number \/ Username:/i);
  expect(linkElement).toBeInTheDocument();
});
