import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { StrictMode } from 'react';

describe('App', () => {
  it('renders login and feed', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(screen.getByText('Decentralized Social Media')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Login with Internet Identity'));
    expect(screen.getByText('Logged in as: principal-demo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });
});
