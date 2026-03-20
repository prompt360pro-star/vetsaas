## 2024-10-24 - Prioritize Error Messages in aria-describedby
**Learning:** In form components, including both hint text and error text in `aria-describedby` can overwhelm screen reader users. When an error is present, the validation feedback is more critical than the general hint.
**Action:** In `Input`, `Textarea`, and `Select` components (and similar form controls), programmatically exclude the hint text ID from `aria-describedby` when an error is present to prioritize validation feedback for screen readers.
