## 2024-07-08 - Accessible Form Controls
**Learning:** Relying purely on parent label elements without explicitly linking them (via `htmlFor`) leaves a11y gaps when IDs are omitted. Also, aria-describedby bindings shouldn't point to elements that aren't rendered.
**Action:** In reusable input/select/textarea components, always use `useId()` to generate fallback IDs, bind labels with `htmlFor`, and conditionally include `aria-describedby`.
