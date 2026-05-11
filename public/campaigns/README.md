# Campaign card images

Drop **full campaign card** images in this folder. Each image is the
ENTIRE card as exported from Figma — the info panel (top), hero visual
(bottom), corner glow, dotted texture, all of it baked in.

The Yap page renders these as clickable cards. No HTML overlays, no
text divs — just the image.

## Naming

Each file must be named after the campaign's `id` (defined in
`src/lib/mock-data.ts`). Supported extensions: `.png`, `.jpg`, `.webp`.

| Campaign  | Filename            |
| --------- | ------------------- |
| Kaito     | `kaito.png`         |
| Lifted    | `lifted.png`        |
| Base      | `base.png`          |
| Layer3    | `layer3.png`        |
| Mimic     | `mimic.png`         |
| Mantle    | `mantle.png`        |
| LayerZero | `layerzero.png`     |
| Artemis   | `artemis.png`       |

## Exporting from Figma

1. Select the **entire campaign card frame** (not just the hero —
   the whole card including the icon, name, description, meta row,
   and hero visual)
2. In the right sidebar → Export panel
3. Set format to **PNG** (or WebP for smaller files)
4. Set scale to **2x** for crisp retina rendering
5. Click Export
6. Drop the file into this folder using the filename from the table above

## Dimensions

The card container has an aspect ratio close to **1:1.05** (very slightly
taller than wide) — same as the Figma layout. `object-cover` is applied
so minor aspect mismatches will crop cleanly rather than distort.

If you want exact dimensions: a 720 × 760 source frame at 2x export
gives a 1440 × 1520 PNG, which renders crisp at any common card width.

## Adding a new campaign

1. Add an entry to `campaigns` in `src/lib/mock-data.ts` with a unique `id`
2. Drop `<that-id>.png` into this folder
3. The Yap page picks it up automatically — no code changes

## Missing files

If an image isn't found, the card shows a subtle dark placeholder
saying which file to drop. The layout doesn't break.
