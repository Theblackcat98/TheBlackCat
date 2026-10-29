## 2024-10-30 - Fix accessible names for search and project repository links
**Learning:** `aria-label`s on buttons that contain visible text must include that visible text in the label to pass the axe-core `label-content-name-mismatch` rule. Removing the `aria-label` entirely and allowing screen readers to use the visible text works. The same principle applies to links.
**Action:** When working on buttons with visible text, prefer allowing screen readers to announce the visible text. If using `aria-label`, ensure it contains the visible text verbatim.
