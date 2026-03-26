
## 2025-02-17 - Accordion ARIA & Focus Polish
**Learning:** Custom disclosure widgets like `Accordion` in `packages/web/src/components/ui/` must include `aria-expanded` and `aria-controls` on the trigger, `role="region"` and `aria-labelledby` on the content wrapper, and appropriate `focus-visible` classes for proper keyboard navigation and accessibility.
**Action:** Always verify that interactive custom components have both full ARIA relationship attributes (`aria-controls`/`aria-labelledby`) and visible focus states (`focus-visible:ring-2`) to support both screen readers and keyboard users.
