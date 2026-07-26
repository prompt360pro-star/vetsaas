## 2026-07-26 - [Added fallback ID generation in UI forms using useId]
**Learning:** React UI components like Input, Select, and Textarea should use `useId()` to generate fallback IDs when `props.id` is omitted by developers. This prevents empty id properties on inputs and ensures `<label htmlFor>` bindings and `aria-describedby` associations correctly resolve.
**Action:** Always implement a `useId()` fallback for forms, conditionally passing `undefined` rather than an empty string to ARIA attributes if they are completely disabled or unrendered.
