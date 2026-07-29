## 2024-07-29 - [Accessibility improvement for form inputs]
**Learning:** React UI components (like Input, Select, Textarea) often lack proper ID linking between labels and form controls by default. Generating a fallback ID with `useId()` ensures screen readers can always associate them correctly without relying on developers explicitly passing an `id`.
**Action:** Always link `<label htmlFor={id}>` with `<input id={id}>` and conditionally bind `aria-describedby` to hint/error element IDs (falling back to `undefined` when empty) when building form inputs.
