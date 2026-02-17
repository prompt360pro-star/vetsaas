export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-7 w-48 bg-surface-200 dark:bg-surface-700 rounded-lg" />
                    <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded-lg mt-2" />
                </div>
                <div className="h-10 w-36 bg-surface-200 dark:bg-surface-700 rounded-xl" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-700" />
                            <div className="h-4 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
                        </div>
                        <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded-lg" />
                        <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded mt-2" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="glass-card p-4 space-y-3">
                <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded-lg" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-700 rounded" />
                            <div className="h-3 w-1/2 bg-surface-200 dark:bg-surface-700 rounded" />
                        </div>
                        <div className="h-6 w-16 bg-surface-200 dark:bg-surface-700 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
