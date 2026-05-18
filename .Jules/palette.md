## 2024-05-18 - Decorative Element Accessible Name Computation
**Learning:** Decorative elements in UI components, such as visual-only required asterisks `*` in forms or pure indicator icons like `Loader2` or decorative icons in buttons, can negatively affect screen reader accessible name computation by being unnecessarily announced to users.
**Action:** Always include `aria-hidden="true"` on these elements (like `<span aria-hidden="true" className="text-danger ml-0.5">*</span>`) to ensure screen readers skip them, keeping the interaction focused and concise.
