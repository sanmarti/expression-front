# Expression Front — Claude Reference

## Stack
- React + Vite SPA, Zustand, React Router, Axios
- AWS: CloudFront (d1wqngcdwjc5l6.cloudfront.net) → S3, CodePipeline (`expression-pipeline-front-prod`, eu-west-3)
- Backend: AWS SAM + Lambda, PostgreSQL on EC2 (15.237.9.24, eu-west-3)
- Pipeline: push to `main` → CodePipeline auto-triggers build + deploy

## Workflow rule
Every change goes all the way in one shot: **edit → commit → push**. Never leave uncommitted changes.

---

## Color rules

### 1. Cockpit indicator colors (`src/constants/avatars.js`)
Three layered helpers — always use the highest-priority one available:

```js
scoreColor(score)
// null → rgba(255,255,255,0.20)
// ≥70  → '#10B981'  (green)
// ≥40  → '#F59E0B'  (amber)
// <40  → '#EF4444'  (red)

radiationColor(indicatorId, fallback)
// reads localStorage 'archetypes_radiation'
// 'confidence' → '#10B981'  (green)
// 'fear'       → '#EF4444'  (red)
// unset        → fallback

indicatorColor(indicatorId, score)
// = radiationColor(indicatorId, scoreColor(score))
// radiation wins; score-based color is the fallback
```

**Rule:** indicator titles, icons, score numbers, and bars must always use `indicatorColor` (or `radiationColor` for title/icon). Applied in: `CockpitPage`, `CockpitWidget`, `MemberCard`.

### 2. StormCloud indicator colors (`src/pages/StormCloudPage.jsx`)
Color is derived purely from the trend arrow — ignore any `color` field on the indicator object:

```
↑  →  '#22c55e'  (green)
→  →  '#3b82f6'  (blue)
↓  →  '#ef4444'  (red)
```

Helper already defined in the file: `trendColor(trend)`. Applied to value text and trend arrow in `PerceptionPanel`. Also drives `useSeverity` (counts ↑/→/↓ per feed).

### 3. Camp climate status colors (`src/components/island/IslandMap.jsx`)
```
favorable → '#22c55e'  green
attention → '#f59e0b'  amber
critical  → '#ef4444'  red
unknown   → '#6b7280'  gray
```

---

## Radiation system (fear / confidence)
Stored in `localStorage` key `'archetypes_radiation'` as `{ [indicatorId]: 'confidence' | 'fear' }`.

Set on the **My Archetypes** page (`/archetypes`) via per-indicator dropdowns.
Read everywhere via `radiationColor()` from `src/constants/avatars.js`.

**Tuned Instruments badge** (`getConfidenceScore()` / `getConfidenceCount()`):
- Counts indicators where radiation === `'confidence'`
- Badge label: `"N/5 Tuned Instruments"` — no emoji
- Hidden when count < 2
- Shown on `CockpitPage` (below indicators) and `CockpitWidget` (above footer)

| Count | Message |
|-------|---------|
| 2/5 | I inspire confidence within my sphere. |
| 3/5 | I inspire confidence in my environment. |
| 4/5 | I sustainably inspire confidence in my environment. |
| 5/5 | I influence and inspire confidence across other environments. |

**Lightbulb** (`💡`) in cockpit card left column — brightness scales with tuned count:
- 0/5: grayscale, very dim (`brightness(0.18)`)
- 3/5: warm glow (`brightness(1.10) + drop-shadow amber`)
- 5/5: maximum brightness (`brightness(2.20) + drop-shadow gold`)

---

## Indicators (5 cockpit dimensions)
Defined in `src/constants/avatars.js` → `INDICATORS` array.

| id | Label (title) | Sublabel | Icon | Color |
|----|--------------|----------|------|-------|
| altitude | SPIRITUAL | Altitude | 🏔️ | #3B82F6 |
| fuel | EMOTIONAL | Fuel | ⛽ | #F59E0B |
| navigation | RATIONAL | Navigation | 🧭 | #14B8A6 |
| speed | RELATIONAL | Speed | ⚡ | #10B981 |
| weight | PHYSICAL | Weight | ⚖️ | #8B5CF6 |

Display pattern: title = dimension (SPIRITUAL), subtitle = cockpit name (Altitude).

---

## StormCloud feeds (6 categories)
Defined in `src/pages/StormCloudPage.jsx` → `FEEDS` array.

| id | Label | Icon | Color |
|----|-------|------|-------|
| political | Political & Social | 🏛️ | #6366f1 |
| environmental | Environmental & Habitat | 🌍 | #22c55e |
| culture | Values & Culture | 🎭 | #f59e0b |
| mental | Mental & Spiritual Health | 🧠 | #a78bfa |
| tech | Tech & Digital | 🤖 | #38bdf8 |
| economic | Economic & Financial | 💰 | #3b82f6 |

Active feed persisted in `localStorage`:
- `'stormcloud_feed_id'` → feed id string
- `'stormcloud_feed_meta'` → `{ icon, label, color }` JSON — shown on island card

---

## Key pages & components

| Path | File |
|------|------|
| `/island` | `src/components/island/IslandMap.jsx` |
| `/cockpit` | `src/pages/CockpitPage.jsx` |
| `/archetypes` | `src/pages/ArchetypesPage.jsx` |
| `/storm-cloud` | `src/pages/StormCloudPage.jsx` |
| `/stakeholder/:id` | `src/pages/StakeholderPage.jsx` |
| `/profile` | `src/pages/ProfilePage.jsx` |
| Floating cockpit card | `src/components/island/CockpitWidget.jsx` |
| Camp card on island | `src/components/island/Campfire.jsx` |
| Member cards | `src/components/members/MemberCard.jsx` |

---

## Archetypes page (`/archetypes`)
- Pentagon layout: `SIZE=560`, `iconR=210`, 5 `IndicatorNode` components at pentagon vertices
- Radar SVG: `size=320`, `R = size * 0.37`, center at `(160, 160)` in SVG coords = `(280, 280)` in parent
- Heartbeat animation: dot shoots center → score point, pulses, fades out (does NOT return). Color = radiation color per axis.
- Ripple ring fires at score point on dot arrival
- "Gota de Daat" tooltip on center dot — implemented as HTML overlay div (not SVG) because parent has `pointerEvents: 'none'`
- Radiation dropdown per node: single open at a time via parent `openDrop` state
- Tooltip z-index: parent node gets `zIndex: 60` when hovered so tooltip clears other circles

---

## StakeholderPage tabs
`Climate → History → Customize → Info`

- **Customize tab**: keyword tag editor, saves `keywords[]` array via `updateStakeholder` API
- **Notes** (Intelligence Feed): right panel, always visible, uses `CommentsSection`

---

## ProfilePage tabs
`Profile → Plan & Billing → Account → Password`

---

## Campfire card (island camp nodes)
Hexagonal SVG shape (flat-top hex), 6 climate indicator emojis in ring, animated glow polygon border, dashed connector line, ping radar ring, camp name label below anchor.
