import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea Component', () => {
    it('associates label with textarea using generated id', () => {
        render(<Textarea label="Comments" />);
        // This should pass if label is associated correctly
        const textarea = screen.getByLabelText('Comments');
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveAttribute('id');
    });

    it('associates error message with textarea using aria-describedby', () => {
        render(<Textarea label="Message" error="Message required" />);
        const textarea = screen.getByLabelText('Message');

        expect(textarea).toHaveAttribute('aria-invalid', 'true');
        const describedBy = textarea.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const errorElement = screen.getByText('Message required');
        expect(errorElement).toHaveAttribute('id', describedBy);
    });

    it('associates hint message with textarea using aria-describedby', () => {
        render(<Textarea label="Feedback" hint="Please be specific" />);
        const textarea = screen.getByLabelText('Feedback');

        const describedBy = textarea.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const hintElement = screen.getByText('Please be specific');
        expect(hintElement).toHaveAttribute('id', describedBy);
    });
});
