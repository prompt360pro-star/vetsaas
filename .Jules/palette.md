## 2024-05-24 - Accessibility bindings for inputs
**Learning:** Found a missing accessible label pattern across primary form entry components (Input, Textarea, Select). Even when labels were visually present, they lacked correct programmatic ID bindings, breaking the experience for screen reader users. Also decorative elements (asterisks and icons) were missing `aria-hidden`.
**Action:** Always use `useId()` in base form components to generate fallback unique IDs so `htmlFor` and `id` remain perfectly paired even if developers forget to pass an ID explicitly.
