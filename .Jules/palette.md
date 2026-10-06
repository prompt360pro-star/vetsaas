## 2026-10-06 - Form accessibility with useId
**Learning:** Reusable UI components need guaranteed unique IDs for `aria-describedby` and `htmlFor` bindings to work properly for screen readers when consumers don't provide explicit IDs.
**Action:** Use React's `useId()` to provide fallback IDs in shared UI components (like `Input`, `Textarea`, `Select`) to dynamically link labels, errors, and hints, while preserving any custom `id` or `aria-describedby` attributes passed via props.
