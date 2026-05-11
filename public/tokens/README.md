# Token icon images

Drop the project logo images you've exported from Figma here. The
TokenIcon component will use these instead of the fallback CSS
glyphs whenever a matching file exists.

## Naming

The component looks up images by lowercased project name, with these
extensions tried in order: `png`, `jpg`, `webp`.

| Project    | Filename             |
| ---------- | -------------------- |
| BTC/USDT   | `btc.png`            |
| Bitcoin    | `bitcoin.png`        |
| DOG/ETH    | `dog.png`            |
| Hoot Dog   | `hootdog.png`        |
| SOL/USDT   | `sol.png`            |
| Solana     | `solana.png`         |
| Base       | `base.png`           |
| BaseEth    | `baseeth.png`        |
| BaseBTC    | `basebtc.png`        |
| Kaito      | `kaito.png`          |
| Lifted     | `lifted.png`         |
| Lifted0.3  | `lifted0.3.png`      |
| ETH        | `eth.png`            |

For any project name not on this list, the component derives the
filename by lowercasing and stripping spaces. So "BaseETH" becomes
`baseeth.png`, "Top 90" becomes `top90.png`, etc.

## Exporting from Figma

1. Select just the icon glyph (the inner rounded square contents)
2. Export as **PNG @ 2x** with a transparent background
3. The component renders the image inside a rounded square frame, so
   you only need the glyph itself, not the surrounding container

## Missing files

If no matching file exists, the component falls back to the existing
CSS-rendered glyph (single letter on tinted background). Nothing
breaks — the design just uses the fallback styling.
