## 2024-05-15 - Dynamic Form A11y
**Learning:** Using `useId()` for fallback IDs and `aria-describedby` perfectly syncs screen readers with validation errors without relying on hardcoded strings. Asterisks (`*`) in labels cause screen readers to announce "star" which is disruptive; they must be hidden via `aria-hidden="true"`.
**Action:** Always wrap visual-only indicators and icons in `aria-hidden="true"` and prefer deterministic React `useId()` for mapping `<label>` and `aria-describedby`.
