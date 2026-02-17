'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';

/* ── Types ───────────────────────────────────────── */

type SparklineVariant = 'primary' | 'success' | 'danger' | 'accent' | 'purple';

interface SparklineProps {
    data: number[];
    variant?: SparklineVariant;
    width?: number;
    height?: number;
    strokeWidth?: number;
    animated?: boolean;
    className?: string;
}

const variantColors: Record<SparklineVariant, { stroke: string; fill: [string, string] }> = {
    primary: { stroke: '#6366f1', fill: ['#6366f1', '#6366f100'] },
    success: { stroke: '#10b981', fill: ['#10b981', '#10b98100'] },
    danger: { stroke: '#ef4444', fill: ['#ef4444', '#ef444400'] },
    accent: { stroke: '#f59e0b', fill: ['#f59e0b', '#f59e0b00'] },
    purple: { stroke: '#8b5cf6', fill: ['#8b5cf6', '#8b5cf600'] },
};

/* ── Helpers ─────────────────────────────────────── */

function buildPath(data: number[], w: number, h: number, padding: number): string {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => ({
        x: padding + (i / (data.length - 1)) * (w - padding * 2),
        y: padding + (1 - (v - min) / range) * (h - padding * 2),
    }));

    // Smooth bezier curve
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
        const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
        d += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
}

function buildAreaPath(linePath: string, w: number, h: number, padding: number): string {
    if (!linePath) return '';
    return `${linePath} L ${w - padding},${h} L ${padding},${h} Z`;
}

/* ── Component ───────────────────────────────────── */

export function Sparkline({
    data,
    variant = 'primary',
    width = 120,
    height = 40,
    strokeWidth = 2,
    animated = true,
    className = '',
}: SparklineProps) {
    const id = useId();
    const colors = variantColors[variant];
    const padding = strokeWidth;

    const linePath = buildPath(data, width, height, padding);
    const areaPath = buildAreaPath(linePath, width, height, padding);
    const gradientId = `sparkline-grad-${id}`;

    if (data.length < 2) return null;

    // Calculate path length for animation
    const pathLength = data.length * 30; // approximate

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={`overflow-visible ${className}`}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.fill[0]} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colors.fill[1]} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <motion.path
                d={areaPath}
                fill={`url(#${gradientId})`}
                initial={animated ? { opacity: 0 } : undefined}
                animate={animated ? { opacity: 1 } : undefined}
                transition={{ duration: 0.6, delay: 0.3 }}
            />

            {/* Line */}
            <motion.path
                d={linePath}
                fill="none"
                stroke={colors.stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
                animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={animated ? { pathLength: pathLength } : undefined}
            />
        </svg>
    );
}
