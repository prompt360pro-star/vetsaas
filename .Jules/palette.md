## UX Learnings

## 2024-03-19 - Keyboard Accessibility for Interactive UI Components
**Learning:** In the `packages/web` workspace, interactive UI components like `Button`, `Pagination`, and `ThemeToggle` lacked explicit focus indicators for keyboard navigation. Additionally, pagination required context-aware `aria-label`s to support screen readers in the default Portuguese language context.
**Action:** Always include `focus-visible` utility classes (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-900`) on custom interactive elements to ensure keyboard accessibility without affecting mouse users, and ensure context-aware `aria-label`s are applied where necessary.
