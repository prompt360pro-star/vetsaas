'use client';

import { useId, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ── Types ───────────────────────────────────────── */

export interface DonutSegment {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    segments: DonutSegment[];
    /** Chart size in px */
    size?: number;
    /** Donut thickness in px */
    thickness?: number;
    /** Center label */
    centerLabel?: string;
    /** Center sublabel */
    centerSublabel?: string;
    /** Show legend */
    showLegend?: boolean;
    /** Animate on mount */
    animated?: boolean;
    className?: string;
}

/* ── Component ───────────────────────────────────── */

export function DonutChart({
    segments,
    size = 160,
    thickness = 20,
    centerLabel,
    centerSublabel,
    showLegend = true,
    animated = true,
    className = '',
}: DonutChartProps) {
    const id = useId();
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const total = useMemo(() => segments.reduce((s, seg) => s + seg.value, 0), [segments]);

    // Calculate offsets for each segment
    const arcs = useMemo(() => {
        let cumulative = 0;
        return segments.map((seg) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dashLength = pct * circumference;
            const dashGap = circumference - dashLength;
            const rotation = (cumulative / total) * 360 - 90;
            cumulative += seg.value;
            return {
                ...seg,
                pct,
                dashArray: `${dashLength} ${dashGap}`,
                rotation,
            };
        });
    }, [segments, total, circumference]);

    return (
        <div className={`flex items-center gap-6 ${className}`}>
            {/* Chart */}
            <div className="relative flex-shrink-0">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        strokeWidth={thickness}
                        className="stroke-surface-100 dark:stroke-surface-800"
                    />

                    {/* Segments */}
                    {arcs.map((arc, i) => (
                        <motion.circle
                            key={`${id}-${arc.label}`}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth={thickness}
                            strokeLinecap="round"
                            strokeDasharray={arc.dashArray}
                            transform={`rotate(${arc.rotation} ${center} ${center})`}
                            initial={animated ? { opacity: 0, strokeDasharray: `0 ${circumference}` } : undefined}
                            animate={{ opacity: 1, strokeDasharray: arc.dashArray }}
                            transition={{ duration: 0.8, delay: 0.15 * i, ease: 'easeOut' }}
                        />
                    ))}
                </svg>

                {/* Center */}
                {(centerLabel || centerSublabel) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {centerLabel && (
                            <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
                                {centerLabel}
                            </span>
                        )}
                        {centerSublabel && (
                            <span className="text-[10px] text-surface-400">
                                {centerSublabel}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="space-y-2 min-w-0 flex-1">
                    {arcs.map((arc) => (
                        <div key={arc.label} className="flex items-center gap-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: arc.color }}
                            />
                            <span className="text-xs text-surface-600 dark:text-surface-400 truncate flex-1">
                                {arc.label}
                            </span>
                            <span className="text-xs font-medium text-surface-900 dark:text-surface-200 tabular-nums">
                                {Math.round(arc.pct * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
