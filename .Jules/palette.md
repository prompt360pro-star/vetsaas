## 2024-05-18 - Form elements accessibility
**Learning:** Using `useId` to dynamically generate IDs for inputs, and correctly associating `<label>` with `htmlFor` and error/hint texts with `aria-describedby`, solves major accessibility gaps for screen readers. Using `aria-hidden="true"` on decorative required asterisks `*` prevents unnecessary noise in screen reader announcements.
**Action:** Always wrap standard HTML form elements with robust wrappers that use `useId` to automatically manage accessibility linkages if an explicit ID is not provided.
