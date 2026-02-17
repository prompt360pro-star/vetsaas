import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-5">
                <Icon className="w-8 h-8 text-surface-400 dark:text-surface-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
