# Design System

## Typography

- **UI Font:** System sans-serif (`system-ui, -apple-system, sans-serif`). Chosen for zero layout shift and zero network cost.
- **Reading Font:** `Georgia, serif`. Chosen for long-form reading comfort, widely available system font.

## Colors & Theming

Uses native CSS media query `prefers-color-scheme: dark` to switch between light and dark themes via CSS custom properties.

## Highlights

To ensure WCAG 2.2 AA accessibility, highlights use a combination of:

1. A semi-transparent background color (for visual weight).
2. A dashed bottom border (for colorblind/contrast accessibility).
3. A textual rank marker in the DOM for screen readers.

## Layout

- Mobile: Single column.
- Desktop: Two columns (Annotated Text | Score & Metrics).
