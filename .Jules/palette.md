## 2026-03-25 - Form Element Accessibility Linkage
**Learning:** When building accessible form components (Input, Textarea, Select), using React's `useId()` ensures unique `id`s for linking `label`s via `htmlFor`. When both error and hint text exist, `aria-describedby` should prioritize the error message's `id` so screen readers immediately announce the validation failure instead of the generic hint.
**Action:** Always map generated IDs to form inputs and conditionally set `aria-describedby` to prioritize error IDs over hint IDs.
