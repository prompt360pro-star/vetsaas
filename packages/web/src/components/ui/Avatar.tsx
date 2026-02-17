'use client';

import React from 'react';

/* ── Types ───────────────────────────────────────── */

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type StatusType = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
    /** Image URL */
    src?: string | null;
    /** Full name for initials fallback */
    name?: string;
    /** Avatar size */
    size?: AvatarSize;
    /** Online status indicator */
    status?: StatusType;
    /** Custom className */
    className?: string;
}

/* ── Config ──────────────────────────────────────── */

const sizeMap: Record<AvatarSize, { container: string; text: string; status: string }> = {
    xs: { container: 'w-6 h-6', text: 'text-[9px]', status: 'w-1.5 h-1.5 ring-1' },
    sm: { container: 'w-8 h-8', text: 'text-[10px]', status: 'w-2 h-2 ring-1' },
    md: { container: 'w-10 h-10', text: 'text-xs', status: 'w-2.5 h-2.5 ring-2' },
    lg: { container: 'w-12 h-12', text: 'text-sm', status: 'w-3 h-3 ring-2' },
    xl: { container: 'w-16 h-16', text: 'text-base', status: 'w-3.5 h-3.5 ring-2' },
};

const statusColors: Record<StatusType, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-surface-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
};

const bgColors = [
    'bg-primary-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
];

/* ── Helpers ─────────────────────────────────────── */

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function hashColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return bgColors[Math.abs(hash) % bgColors.length];
}

/* ── Component ───────────────────────────────────── */

export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
    const cfg = sizeMap[size];

    return (
        <div className={`relative inline-flex flex-shrink-0 ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name ?? 'Avatar'}
                    className={`${cfg.container} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${cfg.container} rounded-full flex items-center justify-center text-white font-semibold ${name ? hashColor(name) : 'bg-surface-400'
                        }`}
                >
                    <span className={cfg.text}>
                        {name ? getInitials(name) : '?'}
                    </span>
                </div>
            )}

            {/* Status dot */}
            {status && (
                <span
                    className={`absolute bottom-0 right-0 ${cfg.status} rounded-full ring-white dark:ring-surface-900 ${statusColors[status]}`}
                />
            )}
        </div>
    );
}

/* ── Avatar Group ────────────────────────────────── */

interface AvatarGroupProps {
    avatars: Array<{ src?: string | null; name?: string }>;
    /** Max to show before +N overflow */
    max?: number;
    size?: AvatarSize;
    className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className = '' }: AvatarGroupProps) {
    const visible = avatars.slice(0, max);
    const overflow = avatars.length - max;
    const cfg = sizeMap[size];

    return (
        <div className={`flex -space-x-2 ${className}`}>
            {visible.map((a, i) => (
                <Avatar
                    key={i}
                    src={a.src}
                    name={a.name}
                    size={size}
                    className="ring-2 ring-white dark:ring-surface-900"
                />
            ))}
            {overflow > 0 && (
                <div
                    className={`${cfg.container} rounded-full flex items-center justify-center bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 font-medium ring-2 ring-white dark:ring-surface-900 ${cfg.text}`}
                >
                    +{overflow}
                </div>
            )}
        </div>
    );
}
