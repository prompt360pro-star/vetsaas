import React from 'react';
import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea Component', () => {
    it('should associate label with textarea using htmlFor and id', () => {
        render(<Textarea label="Description" />);

        // This query looks for a label with the text "Description" and finds the associated textarea
        const textarea = screen.getByLabelText('Description');
        expect(textarea).toBeInTheDocument();
        expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should associate error message with textarea using aria-describedby', () => {
        render(<Textarea label="Bio" error="Bio is required" />);

        const textarea = screen.getByLabelText('Bio');
        expect(textarea).toHaveAttribute('aria-invalid', 'true');

        const errorMessage = screen.getByText('Bio is required');
        const errorId = errorMessage.getAttribute('id');

        expect(errorId).toBeTruthy();
        expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining(errorId!));
    });

    it('should associate hint text with textarea using aria-describedby', () => {
        render(<Textarea label="Comments" hint="Enter any additional comments" />);

        const textarea = screen.getByLabelText('Comments');

        const hintMessage = screen.getByText('Enter any additional comments');
        const hintId = hintMessage.getAttribute('id');

        expect(hintId).toBeTruthy();
        expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining(hintId!));
    });

    it('should not show hint when error is present', () => {
        render(<Textarea label="Feedback" error="Too short" hint="Please be descriptive" />);

        const textarea = screen.getByLabelText('Feedback');
        const errorId = screen.getByText('Too short').getAttribute('id');

        const describedBy = textarea.getAttribute('aria-describedby');
        expect(describedBy).toContain(errorId);

        // Hint should not be in the document
        expect(screen.queryByText('Please be descriptive')).not.toBeInTheDocument();

        expect(describedBy?.trim()).toBe(errorId);
    });
});
