## 2024-06-25 - Form Accessibility Links
**Learning:** Found a pattern across generic form components (Input, Textarea, Select) where labels were visually present but not programmatically linked via `htmlFor`, and validation messages weren't announced via `aria-describedby`. Required indicators (asterisks) were also being announced by screen readers.
**Action:** Applied a consistent pattern using `useId()` for fallback IDs, strict `htmlFor` linkage, and conditionally applied `aria-describedby` arrays. Decorative required indicators should always have `aria-hidden="true"`.
