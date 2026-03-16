## 2024-05-24 - Initial Journal Creation
**Learning:** Journal setup for critical UX/accessibility insights.
**Action:** Ready to log.

## 2024-05-24 - Focus Visibility on Custom Controls
**Learning:** Custom form controls (like Checkbox and RadioGroup) that hide their native inputs using `sr-only` must use Tailwind's `peer` on the input and `peer-focus-visible` on the custom visual elements to ensure keyboard focus states are visible to users navigating via keyboard.
**Action:** Always verify keyboard focus states and implement the `peer` + `peer-focus-visible` pattern when building accessible custom form controls in this design system.
