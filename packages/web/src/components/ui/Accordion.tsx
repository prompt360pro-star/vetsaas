'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    defaultOpen?: string[];
    className?: string;
}

export function Accordion({
    items,
    allowMultiple = false,
    defaultOpen = [],
    className = '',
}: AccordionProps) {
    const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

    const toggle = (id: string) => {
        if (allowMultiple) {
            setOpenIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            );
        } else {
            setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {items.map((item) => {
                const isOpen = openIds.includes(item.id);

                return (
                    <div
                        key={item.id}
                        className={`
                            overflow-hidden rounded-xl border transition-all duration-200
                            ${isOpen
                                ? 'bg-white dark:bg-surface-800 border-primary-200 dark:border-primary-800 shadow-sm'
                                : 'bg-surface-50 dark:bg-surface-900 border-transparent hover:bg-white dark:hover:bg-surface-800 hover:border-surface-200 dark:hover:border-surface-700'
                            }
                        `}
                    >
                        <button
                            onClick={() => toggle(item.id)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-3">
                                {item.icon && (
                                    <span className={`transition-colors ${isOpen ? 'text-primary-500' : 'text-surface-400'}`}>
                                        {item.icon}
                                    </span>
                                )}
                                <span className={`font-medium ${isOpen ? 'text-surface-900 dark:text-surface-100' : 'text-surface-700 dark:text-surface-300'}`}>
                                    {item.title}
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex-shrink-0 ${isOpen ? 'text-primary-500' : 'text-surface-400'}`}
                            >
                                <ChevronDown className="w-5 h-5" />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ height: { duration: 0.3, ease: 'easeOut' }, opacity: { duration: 0.2, delay: 0.1 } }}
                                >
                                    <div className="px-5 pb-5 pt-0 text-sm text-surface-600 dark:text-surface-300 border-t border-dashed border-surface-200 dark:border-surface-700/50 mt-1 pt-4">
                                        {item.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
