'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';

/* ── Types ───────────────────────────────────────── */

interface ProgressRingProps {
    /** 0-100 percentage */
    value: number;
    /** Ring size in px */
    size?: number;
    /** Stroke width in px */
    strokeWidth?: number;
    /** Color of the progress arc */
    color?: string;
    /** Track (background) color */
    trackColor?: string;
    /** Center label (e.g. "75%") */
    label?: string;
    /** Sublabel text */
    sublabel?: string;
    /** Animate on mount */
    animated?: boolean;
    className?: string;
}

/* ── Component ───────────────────────────────────── */

export function ProgressRing({
    value,
    size = 120,
    strokeWidth = 10,
    color = '#6366f1',
    trackColor = 'currentColor',
    label,
    sublabel,
    animated = true,
    className = '',
}: ProgressRingProps) {
    const id = useId();
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;
    const center = size / 2;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Gradient */}
                <defs>
                    <linearGradient id={`ring-grad-${id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                {/* Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    className="opacity-10"
                />

                {/* Progress */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={`url(#ring-grad-${id})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={animated ? { strokeDashoffset: circumference } : undefined}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </svg>

            {/* Center label */}
            {(label || sublabel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {label && (
                        <span className="text-lg font-bold text-surface-900 dark:text-surface-50">
                            {label}
                        </span>
                    )}
                    {sublabel && (
                        <span className="text-[10px] text-surface-400 mt-0.5">
                            {sublabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
