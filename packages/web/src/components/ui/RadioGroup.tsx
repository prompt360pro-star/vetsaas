'use client';

import { motion } from 'framer-motion';

interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    name?: string;
    direction?: 'vertical' | 'horizontal';
    className?: string;
}

export function RadioGroup({
    options,
    value,
    onChange,
    name,
    direction = 'vertical',
    className = '',
}: RadioGroupProps) {
    return (
        <div
            role="radiogroup"
            className={`flex ${direction === 'vertical' ? 'flex-col space-y-3' : 'flex-row space-x-4'} ${className}`}
        >
            {options.map((option) => {
                const isSelected = value === option.value;
                const isDisabled = option.disabled;

                return (
                    <label
                        key={option.value}
                        className={`
                            relative flex items-start gap-3 cursor-pointer group
                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => !isDisabled && onChange(option.value)}
                            className="sr-only"
                        />

                        {/* Custom Radio Circle */}
                        <div className={`
                            relative w-5 h-5 mt-0.5 rounded-full border-2 transition-colors flex items-center justify-center flex-shrink-0
                            ${isSelected
                                ? 'border-primary-500'
                                : 'border-surface-300 dark:border-surface-600 group-hover:border-primary-400 dark:group-hover:border-primary-500'
                            }
                        `}>
                            {isSelected && (
                                <motion.div
                                    layoutId={`radio-pill-${name}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="w-2.5 h-2.5 rounded-full bg-primary-500"
                                />
                            )}
                        </div>

                        <div className="flex-1">
                            <p className={`text-sm font-medium ${isDisabled ? 'text-surface-400' : 'text-surface-700 dark:text-surface-200'}`}>
                                {option.label}
                            </p>
                            {option.description && (
                                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                                    {option.description}
                                </p>
                            )}
                        </div>
                    </label>
                );
            })}
        </div>
    );
}
