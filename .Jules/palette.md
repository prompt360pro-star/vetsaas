## 2026-02-24 - Accessibility Gap in Form Components
**Learning:** Core form components (`Input`, `Textarea`) lacked programmatic association between labels and inputs, relying purely on visual proximity.
**Action:** Implemented `useId()` to automatically generate IDs and link `htmlFor` and `aria-describedby` props, ensuring screen reader support without manual ID management.
