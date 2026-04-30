## 2024-05-15 - [Initial setup]
**Learning:** Initial journal setup
**Action:** Created .Jules/palette.md

## 2024-05-15 - [Form Component Accessibility]
**Learning:** React's `useId()` generates deterministic unique IDs that are perfect for associating `<label htmlFor="...">` with inputs, and linking `aria-describedby` to error/hint messages. Passing `undefined` to these attributes removes them entirely when not needed. Decorative elements like asterisks for required fields should always use `aria-hidden="true"` to keep screen reader announcements clean.
**Action:** When creating or updating form components (`Input`, `Select`, `Textarea`), apply this complete accessibility pattern to ensure forms are robust for screen reader users.
