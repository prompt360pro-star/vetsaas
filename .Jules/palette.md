
## 2024-07-12 - [Accessibility] Fallback IDs for Form components
**Learning:** React form components frequently lack programmatic association between labels, descriptions, errors, and inputs because explicit `id` props are often omitted by consumers.
**Action:** Use React's `useId()` inside generic UI components to guarantee robust, zero-config accessibility (via `id`, `htmlFor`, and `aria-describedby`) without forcing developers to manually track unique DOM IDs across complex forms.
