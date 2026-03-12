## 2024-05-18 - Keyboard Accessibility for Custom Form Controls

**Learning:** Custom form elements like `Checkbox` and `RadioGroup` that hide their native `<input>` elements using `sr-only` often fail to show a focus state when navigated via keyboard. This makes the UI inaccessible for keyboard-only users who cannot visually determine which element currently holds focus. The issue is easily overlooked when testing primarily with a mouse.

**Action:** When building custom styled inputs, ensure the native hidden input has a `peer` class (e.g., `className="peer sr-only"`) and apply `peer-focus-visible` utility classes (like `peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500`) to the adjacent custom visual element to accurately reflect the keyboard focus state.
