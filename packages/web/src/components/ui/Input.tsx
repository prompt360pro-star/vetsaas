'use client';

import { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, hint, className = '', id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const errorId = error ? `${inputId}-error` : undefined;
        const hintId = hint ? `${inputId}-hint` : undefined;

        // Only include hintId if it's actually rendered (when there is no error)
        const showHint = hint && !error;

        // Combine aria-describedby from props and our internal logic
        const ariaDescribedBy = [
            props['aria-describedby'],
            errorId,
            showHint ? hintId : undefined
        ].filter(Boolean).join(' ') || undefined;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-danger ml-0.5">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
                            {icon}
                        </span>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={`input-premium ${icon ? 'pl-11' : ''} ${error
                            ? 'border-danger focus:ring-danger/50 focus:border-danger'
                            : ''
                            } ${className}`}
                        aria-invalid={error ? 'true' : undefined}
                        aria-describedby={ariaDescribedBy}
                        {...props}
                    />
                </div>
                {error && (
                    <p
                        id={errorId}
                        className="mt-1.5 text-xs text-danger flex items-center gap-1"
                    >
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p
                        id={hintId}
                        className="mt-1.5 text-xs text-surface-400"
                    >
                        {hint}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
