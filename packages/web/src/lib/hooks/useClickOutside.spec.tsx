import { render, screen, fireEvent } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';
import React from 'react';

const TestComponent = ({ onClickOutside }: { onClickOutside: () => void }) => {
    const ref = useClickOutside<HTMLDivElement>(onClickOutside);

    return (
        <div>
            <div data-testid="outside">Outside</div>
            <div ref={ref} data-testid="inside">
                Inside
                <div data-testid="inside-child">Inside Child</div>
            </div>
        </div>
    );
};

describe('useClickOutside', () => {
    it('should call onClickOutside when clicking outside the element', () => {
        const onClickOutside = jest.fn();
        render(<TestComponent onClickOutside={onClickOutside} />);

        fireEvent.mouseDown(screen.getByTestId('outside'));
        expect(onClickOutside).toHaveBeenCalledTimes(1);
    });

    it('should not call onClickOutside when clicking inside the element', () => {
        const onClickOutside = jest.fn();
        render(<TestComponent onClickOutside={onClickOutside} />);

        fireEvent.mouseDown(screen.getByTestId('inside'));
        expect(onClickOutside).not.toHaveBeenCalled();
    });

    it('should not call onClickOutside when clicking inside a child of the element', () => {
        const onClickOutside = jest.fn();
        render(<TestComponent onClickOutside={onClickOutside} />);

        fireEvent.mouseDown(screen.getByTestId('inside-child'));
        expect(onClickOutside).not.toHaveBeenCalled();
    });

    it('should clean up the event listener on unmount', () => {
        const onClickOutside = jest.fn();
        const { unmount } = render(<TestComponent onClickOutside={onClickOutside} />);

        unmount();

        // Simulate click after unmount
        fireEvent.mouseDown(document);
        expect(onClickOutside).not.toHaveBeenCalled();
    });
});
