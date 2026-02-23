import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea Component', () => {
    it('associates label with textarea', () => {
        render(<Textarea label="Bio" />);
        // This relies on accessible relationship (htmlFor -> id)
        const textarea = screen.getByLabelText('Bio');
        expect(textarea).toBeInTheDocument();
    });

    it('associates error message with textarea via aria-describedby', () => {
        render(<Textarea label="Bio" error="Too long" />);
        const textarea = screen.getByLabelText('Bio');
        const errorMessage = screen.getByText('Too long');

        const describedBy = textarea.getAttribute('aria-describedby');
        expect(describedBy).toBeDefined();
        expect(errorMessage).toHaveAttribute('id', describedBy);
    });

    it('associates hint message with textarea via aria-describedby', () => {
        render(<Textarea label="Bio" hint="Tell us about yourself" />);
        const textarea = screen.getByLabelText('Bio');
        const hintMessage = screen.getByText('Tell us about yourself');

        const describedBy = textarea.getAttribute('aria-describedby');
        expect(describedBy).toBeDefined();
        expect(hintMessage).toHaveAttribute('id', describedBy);
    });

    it('uses provided id if available', () => {
        render(<Textarea label="Bio" id="bio-field" />);
        const textarea = screen.getByLabelText('Bio');
        expect(textarea).toHaveAttribute('id', 'bio-field');
    });
});
