## 2024-05-18 - [Form Controls Accessibility]
**Learning:** React form components without explicit IDs lack screen reader context for labels, hints, and error messages.
**Action:** Always use `useId()` in UI form components to automatically generate and link IDs between labels (`htmlFor`), inputs (`id`), and error/hint elements (`aria-describedby`), ensuring robust accessibility even if developers forget to pass an explicit ID prop.
