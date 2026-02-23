import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
    it('associates label with input', () => {
        render(<Input label="Email Address" />);
        // This relies on accessible relationship (htmlFor -> id)
        const input = screen.getByLabelText('Email Address');
        expect(input).toBeInTheDocument();
    });

    it('associates error message with input via aria-describedby', () => {
        render(<Input label="Email" error="Invalid email" />);
        // If getByLabelText fails, the test fails early, which is what we want
        const input = screen.getByLabelText('Email');
        const errorMessage = screen.getByText('Invalid email');

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeDefined();
        expect(errorMessage).toHaveAttribute('id', describedBy);
    });

    it('associates hint message with input via aria-describedby', () => {
        render(<Input label="Username" hint="Enter your username" />);
        const input = screen.getByLabelText('Username');
        const hintMessage = screen.getByText('Enter your username');

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeDefined();
        expect(hintMessage).toHaveAttribute('id', describedBy);
    });

    it('uses provided id if available', () => {
        render(<Input label="Password" id="password-field" />);
        const input = screen.getByLabelText('Password');
        expect(input).toHaveAttribute('id', 'password-field');
    });
});
