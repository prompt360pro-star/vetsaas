## 2024-05-23 - Form Component Accessibility Learnings
**Learning:** React custom form components (`Input`, `Textarea`, `Select`) often fail accessibility checks when developers forget to pass an explicit `id` prop, because `<label htmlFor>` and `aria-describedby` rely on it.
**Action:** Always use React's `useId()` inside generic UI components to generate a guaranteed fallback `id`. This ensures elements are correctly associated for screen readers even when an explicit `id` is omitted. Also, add `aria-hidden="true"` to visual-only elements like required asterisks (`*`).
