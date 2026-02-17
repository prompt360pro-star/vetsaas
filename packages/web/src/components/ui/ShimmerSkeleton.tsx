import React from 'react';

/* ── Types ───────────────────────────────────────── */

interface ShimmerSkeletonProps {
    className?: string;
    /** Rounded variant */
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    /** Fixed width (CSS value) */
    width?: string;
    /** Fixed height (CSS value) */
    height?: string;
}

/* ── Component ───────────────────────────────────── */

export function ShimmerSkeleton({
    className = '',
    rounded = 'lg',
    width,
    height,
}: ShimmerSkeletonProps) {
    const roundedClass = `rounded-${rounded}`;

    return (
        <div
            className={`shimmer-skeleton ${roundedClass} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
}

/* ── Preset Variants ─────────────────────────────── */

export function ShimmerText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <ShimmerSkeleton
                    key={i}
                    height="14px"
                    className={i === lines - 1 ? 'w-2/3' : 'w-full'}
                />
            ))}
        </div>
    );
}

export function ShimmerCard({ className = '' }: { className?: string }) {
    return (
        <div className={`p-5 space-y-4 ${className}`}>
            <div className="flex items-center gap-3">
                <ShimmerSkeleton width="44px" height="44px" rounded="2xl" />
                <div className="flex-1 space-y-2">
                    <ShimmerSkeleton height="14px" className="w-1/2" />
                    <ShimmerSkeleton height="10px" className="w-1/3" />
                </div>
            </div>
            <ShimmerSkeleton height="28px" className="w-1/2" />
            <ShimmerSkeleton height="10px" className="w-2/3" />
            <ShimmerSkeleton height="32px" className="w-full" rounded="xl" />
        </div>
    );
}

export function ShimmerAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
    return (
        <ShimmerSkeleton
            width={`${size}px`}
            height={`${size}px`}
            rounded="full"
            className={className}
        />
    );
}
