import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
    it('associates label with input using generated id', () => {
        render(<Input label="Email Address" />);
        // This should pass if label is associated correctly
        const input = screen.getByLabelText('Email Address');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id');
    });

    it('associates error message with input using aria-describedby', () => {
        render(<Input label="Email" error="Invalid email" />);
        // We might need to find by role if label text fails initially, but failing is the point.
        // Let's use getByRole to inspect attributes even if label association fails?
        // No, let's stick to getByLabelText to prove the accessibility failure first.

        // Actually, if getByLabelText fails, the test stops there. That's fine.
        // But to test other attributes, maybe we should find by role or placeholder if label fails.
        // Let's just use getByRole('textbox') if we want to check other things, but here the failure is the goal.

        // Let's assume we fix label first, then check error association.
        // For now, I'll write the test assuming the desired state.

        // If I want to verify aria-describedby, I need to get the element.
        // If getByLabelText fails, I can't verify aria-describedby via label.

        // I will use a test that tries to find by label text.
        const input = screen.getByLabelText('Email');

        expect(input).toHaveAttribute('aria-invalid', 'true');
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const errorElement = screen.getByText('Invalid email');
        expect(errorElement).toHaveAttribute('id', describedBy);
    });

    it('associates hint message with input using aria-describedby', () => {
        render(<Input label="Username" hint="Enter unique username" />);
        const input = screen.getByLabelText('Username');

        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        const hintElement = screen.getByText('Enter unique username');
        expect(hintElement).toHaveAttribute('id', describedBy);
    });
});
