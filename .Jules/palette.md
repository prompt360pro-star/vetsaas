## 2026-03-14 - Dynamic aria-describedby for Form Fields
**Learning:** Prioritizing error validation feedback for screen readers by omitting hint text from `aria-describedby` when an error exists ensures that users receive the most critical context first, reducing cognitive overload and confusion during form correction.
**Action:** In form components (`Input`, `Textarea`, `Select`), hint text is programmatically excluded from `aria-describedby` when an error is present, leveraging React's `useId` to securely associate labels and dynamic states.
