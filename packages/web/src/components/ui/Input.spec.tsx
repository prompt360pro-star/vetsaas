import { render, screen } from '@testing-library/react';
import { Input } from './Input';
import '@testing-library/jest-dom';

describe('Input Component Accessibility', () => {
  it('associates label with input', () => {
    render(<Input label="Email Address" />);
    // This will fail if the label is not correctly associated with the input
    const input = screen.getByLabelText('Email Address');
    expect(input).toBeInTheDocument();
  });

  it('associates error message with input', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    // This expects aria-describedby to point to the error element
    expect(input).toHaveAccessibleDescription('Invalid email');
  });

  it('associates hint with input', () => {
    render(<Input label="Password" hint="Minimum 8 characters" />);
    const input = screen.getByLabelText('Password');
    // This expects aria-describedby to point to the hint element
    expect(input).toHaveAccessibleDescription('Minimum 8 characters');
  });
});
