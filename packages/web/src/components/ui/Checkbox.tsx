'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    checked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
    label,
    description,
    checked,
    indeterminate,
    onCheckedChange,
    disabled,
    className = '',
    ...props
}: CheckboxProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(e.target.checked);
    };

    return (
        <label className={`flex items-start gap-3 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
            <div className="relative flex items-center h-5 mt-0.5">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    {...props}
                />

                <motion.div
                    className={`
                        w-5 h-5 rounded-md border transition-colors flex items-center justify-center
                        ${checked || indeterminate
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600 group-hover:border-primary-400 dark:group-hover:border-primary-500'
                        }
                    `}
                    initial={false}
                    animate={{ scale: checked || indeterminate ? 1 : 1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <AnimatePresence>
                        {(checked || indeterminate) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.1 }}
                            >
                                {indeterminate ? (
                                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {(label || description) && (
                <div className="flex-1">
                    {label && (
                        <p className={`text-sm font-medium ${disabled ? 'text-surface-400' : 'text-surface-700 dark:text-surface-200'}`}>
                            {label}
                        </p>
                    )}
                    {description && (
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </label>
    );
}
