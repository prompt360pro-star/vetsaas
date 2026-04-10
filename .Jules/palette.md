## 2026-04-10 - Add aria-hidden to decorative icons
**Learning:** Screen readers will unnecessarily announce decorative icons (like Lucide's Loader2, Sun, Moon) if they aren't explicitly hidden, which adds noise for users relying on assistive technologies. Even generic icon wrappers (like a span around an arbitrary icon prop) need to be hidden.
**Action:** Always add `aria-hidden="true"` to icons that provide visual decoration or state indicators without text equivalents, especially in frequently used atomic components like Buttons and ThemeToggles.
