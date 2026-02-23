'use client';

import { forwardRef, useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = '', id, ...props }, ref) => {
        const generatedId = useId();
        const textareaId = id || generatedId;
        const errorId = error ? `${textareaId}-error` : undefined;
        const hintId = hint && !error ? `${textareaId}-hint` : undefined;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-danger ml-0.5">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`input-premium min-h-[100px] resize-y ${error
                        ? 'border-danger focus:ring-danger/50 focus:border-danger'
                        : ''
                        } ${className}`}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
                    {...props}
                />
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

Textarea.displayName = 'Textarea';
