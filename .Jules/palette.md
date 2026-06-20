## 2026-06-20 - Form Element Accessibility
**Learning:** For React form components like Input, Textarea, and Select, providing explicit IDs mapping `<label htmlFor>` to the input and mapping errors/hints using `aria-describedby` makes them fully screen-reader accessible. Users often forget to pass explicit `id` props, breaking this linkage.
**Action:** Use React's `useId()` to generate fallback IDs internally within the UI components. This ensures proper ARIA linkages (for labels, hints, and errors) always work out of the box, even when developers omit explicit IDs.
