## 2024-05-17 - Dynamic ID Generation for Accessible Forms
**Learning:** React form components in this app (Input, Select, Textarea) often lacked linked labels (`htmlFor`), and `aria-describedby` for hints/errors because unique IDs weren't always passed as props. Hardcoding IDs breaks when components are reused multiple times on the same page.
**Action:** Always use React's `useId()` to generate fallback IDs in reusable form components, allowing developers to omit the `id` prop while maintaining perfect screen reader accessibility for labels, errors, and hints.
