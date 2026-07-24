## 2026-07-24 - Enhance form control accessibility
**Learning:** Using `useId()` in reusable form components (Input, Textarea, Select) provides robust, automatic linking for `<label htmlFor>` and `aria-describedby`, significantly improving screen reader support without requiring explicit IDs from consumers. Decorative elements like required asterisks and icons must be explicitly hidden with `aria-hidden='true'`.
**Action:** Always implement auto-generated IDs and conditional ARIA associations in base UI components to guarantee a baseline level of accessibility across the application.
