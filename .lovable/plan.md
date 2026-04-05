

## Plan: Watermark Behind Content

### Change
Move the watermark overlay **behind** the sync page content instead of on top, so it appears as a background layer.

### Implementation in `src/pages/WarSync.tsx`

1. Add a watermark div inside the content container with `z-index: 0` (or `-1`) positioned absolutely behind all content
2. Wrap the actual page content in a relative div with `z-index: 1` so cards/buttons render on top
3. Watermark shows user email + date in a repeating diagonal pattern at ~0.06 opacity
4. Add `@media print` style to hide content when printing
5. Keep existing anti-screenshot blur/select protections

### Visual Stack
```text
z-1  ──  watermark layer (user@email.com repeating diagonal)
z-1  ──  page content (league buttons, cards, etc.) on top
```

### Files to Modify
- `src/pages/WarSync.tsx` — add watermark div behind content

