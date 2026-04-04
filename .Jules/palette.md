## 2026-04-04 - [Proper Accessible Linking for Form Components]
**Learning:** Relying solely on layout hierarchy is insufficient for screen readers; explicit linkages via `id` and `htmlFor` are strictly required for reliable accessibility context.
**Action:** Ensure all form components (Input, Textarea, Select) programmatically generate unique IDs via `useId()` if no ID is passed, mapping their `<label>` elements, error messages, and hint messages explicitly using `htmlFor` and `aria-describedby`.
