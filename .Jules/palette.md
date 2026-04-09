# Palette's Journal

## 2024-04-09 - Accessible Form Components
**Learning:** Next.js Server Components require `useId` from React 18+ to guarantee unique IDs for hydration matching across client and server. Screen readers strictly require unique `id` / `htmlFor` mappings to announce `<label>` elements for inputs, and `aria-describedby` to associate validation messages with inputs.
**Action:** When implementing custom form components (`Input`, `Textarea`, `Select`), always provide an auto-generated fallback `id` via `useId()` if none is explicitly provided, to ensure robust a11y without burdening the parent component to provide unique IDs.
