## 2024-05-19 - Improved form field accessibility
**Learning:** In reusable UI components, explicitly associating labels, errors, and hints with their corresponding inputs ensures better accessibility and click targets. When generating dynamic IDs or checking optional states, passing `undefined` to ARIA attributes instead of an empty string ensures React completely omits the attribute if it isn't needed.

**Action:** Consistently use `useId()` and a `[...].filter(Boolean).join(' ') || undefined` pattern in future form components when defining `aria-describedby` dependencies to keep the DOM clean when states are inactive. Also always `aria-hidden="true"` purely visual form indicators like `*` asterisks or icons.
