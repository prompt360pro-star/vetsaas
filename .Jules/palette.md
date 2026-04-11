## 2026-04-11 - Accessible Form Labels and Descriptions
**Learning:** By default, standard form components (, , ) in this design system lacked proper robust ID bindings and dynamic association for error/hint text via  when multiple instances might appear on a page.
**Action:** Implemented React's `useId()` to generate hydration-safe fallback IDs to explicitly link labels via `htmlFor`, and conditionally added `aria-describedby` to announce error/hint strings to screen readers automatically. This is a critical reusable pattern for all complex input components moving forward.

## 2024-05-18 - Accessible Form Labels and Descriptions
**Learning:** By default, standard form components (`Input`, `Textarea`, `Select`) in this design system lacked proper robust ID bindings and dynamic association for error/hint text via `aria-describedby` when multiple instances might appear on a page.
**Action:** Implemented React's `useId()` to generate hydration-safe fallback IDs to explicitly link labels via `htmlFor`, and conditionally added `aria-describedby` to announce error/hint strings to screen readers automatically. This is a critical reusable pattern for all complex input components moving forward.
