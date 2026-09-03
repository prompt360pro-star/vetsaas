## 2024-09-03 - Form Component Accessibility Update
**Learning:** React form elements like `Input`, `Select`, and `Textarea` frequently rely on developer-provided IDs, which are often forgotten. This breaks critical accessibility bindings (`<label htmlFor>` and `<input id>`).
**Action:** Always utilize React's `useId()` inside form components to fallback on an auto-generated unique identifier when a prop ID isn't provided. Link it to `error` and `hint` attributes using `aria-describedby` dynamically mapping `id` generated from `useId()`.
