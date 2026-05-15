## 2025-02-12 - Reusable Form Input Accessibility Patterns
**Learning:** Adding dynamic IDs using `useId()` and linking labels with inputs (`htmlFor`) and helper text (`aria-describedby`) is an essential, highly repeatable UX accessibility standard for this app's components, greatly improving screen reader experience without adding visual bulk. Also, adding `aria-hidden="true"` to visual asterisks `*` prevents unnecessary repetitive announcements.
**Action:** Apply this pattern as a standard rule for any newly created form components in `packages/web`.
