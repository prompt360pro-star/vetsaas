'use client';

import { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    content: string;
    placement?: Placement;
    children: React.ReactElement;
}

const placementStyles: Record<Placement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const originMap: Record<Placement, string> = {
    top: 'origin-bottom',
    bottom: 'origin-top',
    left: 'origin-right',
    right: 'origin-left',
};

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
    const [show, setShow] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const tooltipId = useId();

    const open = () => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setShow(true), 200);
    };
    const close = () => {
        clearTimeout(timeoutRef.current);
        setShow(false);
    };

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={open}
            onMouseLeave={close}
            onFocus={open}
            onBlur={close}
        >
            <span aria-describedby={show ? tooltipId : undefined}>
                {children}
            </span>
            <AnimatePresence>
                {show && (
                    <motion.span
                        id={tooltipId}
                        role="tooltip"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-surface-900 dark:bg-surface-100 dark:text-surface-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${placementStyles[placement]} ${originMap[placement]}`}
                    >
                        {content}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
}
