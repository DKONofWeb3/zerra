# Creator avatars

Drop creator profile photos here. Used by:
- The **Top Creators** leaderboard table (`/yap/top-creators`)
- The **Top Performing** featured creator cards (`/yap/top-performing`)

## Naming

The component looks up images by creator id. Try `.png` then `.jpg`
then `.webp` in order. If none exist, a colored fallback circle is
shown with no breakage.

## Required (or used) files

| File                  | Used for                                           |
| --------------------- | -------------------------------------------------- |
| `adam-captain.png`    | Featured card on Top Performing (red trend chart)  |
| `sarah-captain.png`   | Featured card on Top Performing (green trend chart)|
| `creator-1.png`       | Top Creators row 1                                 |
| `creator-2.png`       | Top Creators row 2                                 |
| `creator-3.png`       | Top Creators row 3                                 |
| `creator-4.png`       | Top Creators row 4                                 |
| `creator-5.png`       | Top Creators row 5                                 |
| `creator-6.png`       | Top Creators row 6                                 |
| `creator-7.png`       | Top Creators row 7                                 |
| `creator-8.png`       | Top Creators row 8                                 |

## Exporting from Figma

1. Select the avatar/photo frame
2. Export as **PNG @ 2x** (square aspect, the component will mask it)
3. Drop into this folder using the filename above
