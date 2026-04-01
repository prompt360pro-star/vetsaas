
## 2024-11-20 - Keyboard Focus Visibility for Custom Form Controls hiding Native Inputs
**Learning:** Custom UI components like Checkbox and RadioGroup that hide native inputs with `.sr-only` must use Tailwind's `.peer` class on the native input and `.peer-focus-visible` variants on the custom visible element. Without these, keyboard users cannot see where focus is, violating accessibility guidelines.
**Action:** When creating custom form controls, always link the hidden native input and the visible custom styling element using `peer` and `peer-focus-visible:ring-X` to ensure proper focus indicators are drawn for keyboard users.
