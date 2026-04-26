## 2024-05-24 - Form Control Accessibility
**Learning:** The generic `Input`, `Textarea`, and `Select` components lack programmatic `<label>` association (`htmlFor`) and `aria-describedby` attributes for error/hint text, which breaks screen reader support for critical form flows. Additionally, required asterisks are read aloud unnecessarily.
**Action:** Use React's `useId()` to generate unique fallback IDs linking labels to inputs. Connect error and hint messages using `aria-describedby`, prioritizing errors. Add `aria-hidden="true"` to decorative elements like required asterisks and icons.
