'use client';

import { useState, useRef, useEffect } from 'react';

interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    label?: string;
    formatValue?: (value: number) => string;
    showValue?: boolean;
    disabled?: boolean;
    className?: string;
}

export function Slider({
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    label,
    formatValue = (v) => v.toString(),
    showValue = true,
    disabled = false,
    className = '',
}: SliderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const percentage = ((value - min) / (max - min)) * 100;

    const handleInteract = (clientX: number) => {
        if (disabled || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = x / rect.width;

        let newValue = min + percentage * (max - min);

        // Snap to step
        if (step > 0) {
            newValue = Math.round(newValue / step) * step;
        }

        // Clamp
        newValue = Math.max(min, Math.min(max, newValue));

        onChange(newValue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteract(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteract(e.touches[0].clientX);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => handleInteract(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleInteract(e.touches[0].clientX);
        const onEnd = () => setIsDragging(false);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDragging]);

    return (
        <div className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            {(label || showValue) && (
                <div className="flex justify-between mb-2">
                    {label && (
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            {label}
                        </span>
                    )}
                    <span className="text-sm font-mono text-surface-500 dark:text-surface-400">
                        {formatValue(value)}
                    </span>
                </div>
            )}

            <div
                ref={trackRef}
                className="relative h-6 flex items-center cursor-pointer touch-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Track Background */}
                <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    {/* Track Fill */}
                    <div
                        className="h-full bg-primary-500 transition-all duration-75 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Thumb */}
                <div
                    className={`
                        absolute w-5 h-5 bg-white border-2 border-primary-500 rounded-full shadow-md transform -translate-x-1/2 transition-shadow duration-100 ease-out
                        ${isDragging ? 'scale-110 shadow-lg ring-4 ring-primary-500/20' : 'hover:scale-110'}
                    `}
                    style={{ left: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
