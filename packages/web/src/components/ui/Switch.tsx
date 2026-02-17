'use client';

import { motion } from 'framer-motion';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
    lg: { track: 'w-14 h-8', thumb: 'w-7 h-7', translate: 24 },
};

export function Switch({ checked, onChange, disabled, size = 'md', className = '' }: SwitchProps) {
    const config = sizeMap[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
                relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900
                ${checked ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${config.track}
                ${className}
            `}
        >
            <span className="sr-only">Toggle</span>
            <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`${config.thumb} bg-white rounded-full shadow-sm pointer-events-none block mx-0.5`}
                animate={{ x: checked ? config.translate : 0 }}
            />
        </button>
    );
}
