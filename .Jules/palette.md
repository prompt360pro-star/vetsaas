## 2026-05-17 - Semantic Association in React Forms
**Learning:** Relying on manually provided IDs in generic form components is brittle. Using React's `useId` provides a robust fallback to guarantee label-to-input association and dynamic `aria-describedby` linking without hydration mismatches.
**Action:** Always implement `useId` in base form controls to ensure baseline accessibility regardless of consumption.
