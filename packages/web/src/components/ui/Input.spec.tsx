import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
    it('should associate label with input using htmlFor and id', () => {
        render(<Input label="Email Address" />);

        // This query looks for a label with the text "Email Address" and finds the associated input
        // It will fail if the association (htmlFor -> id) is missing
        const input = screen.getByLabelText('Email Address');
        expect(input).toBeInTheDocument();
    });

    it('should associate error message with input using aria-describedby', () => {
        render(<Input label="Password" error="Password is required" />);

        const input = screen.getByLabelText('Password');
        expect(input).toHaveAttribute('aria-invalid', 'true');

        // The error message should be linked
        const errorMessage = screen.getByText('Password is required');
        const errorId = errorMessage.getAttribute('id');

        expect(errorId).toBeTruthy();
        expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(errorId!));
    });

    it('should associate hint text with input using aria-describedby', () => {
        render(<Input label="Username" hint="Enter your unique username" />);

        const input = screen.getByLabelText('Username');

        const hintMessage = screen.getByText('Enter your unique username');
        const hintId = hintMessage.getAttribute('id');

        expect(hintId).toBeTruthy();
        expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(hintId!));
    });

    it('should not show hint when error is present', () => {
        render(<Input label="Bio" error="Too short" hint="Write something about yourself" />);

        const input = screen.getByLabelText('Bio');
        const errorId = screen.getByText('Too short').getAttribute('id');

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toContain(errorId);

        // Hint should not be in the document
        expect(screen.queryByText('Write something about yourself')).not.toBeInTheDocument();

        // Hint ID should not be in aria-describedby
        // Since we can't get the ID of a non-existent element, we just check that aria-describedby only contains the error ID (plus potentially extra whitespace if we were sloppy, but we filtered Boolean)
        expect(describedBy?.trim()).toBe(errorId);
    });
});
