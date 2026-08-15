
## 2024-08-15 - [Form Controls ARIA Linkages]
**Learning:** Using `useId()` in core form components (Input, Textarea, Select) ensures robust `htmlFor` and `aria-describedby` associations for screen readers, even when developers omit explicit IDs.
**Action:** Always include fallback ID generation and dynamic `aria-describedby` arrays `[errorId, hintId].filter(Boolean)` in reusable form primitives to enforce accessibility by default.
