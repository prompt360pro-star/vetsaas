## 2026-10-28 - Dynamic Form IDs with useId()
**Learning:** React 18`s `useId()` is an ideal fallback for generating stable IDs in reusable form components to ensure `htmlFor`/`id` bindings and `aria-describedby` associations are always present, even if developers forget to explicitly pass IDs.
**Action:** Always wrap standard HTML input elements with `useId()` fallback logic and explicitly destructure conflicting properties like `aria-describedby` to allow proper merging of internal hints/errors and externally provided descriptions.
