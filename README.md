# @scoobynko/snake-loader

A React loader in the style of the Nokia 3310 Snake game. Indeterminate or progress-driven. Zero runtime dependencies. ~4kb gzipped.

![npm](https://img.shields.io/npm/v/@scoobynko/snake-loader) ![license](https://img.shields.io/npm/l/@scoobynko/snake-loader)

**Live demo:** https://jakubsalmik.com/snake-loader

## Install

```bash
npm install @scoobynko/snake-loader
```

## Usage

```tsx
import { SnakeLoader } from "@scoobynko/snake-loader";
import "@scoobynko/snake-loader/styles.css";

// Indeterminate — snake roams forever
<SnakeLoader />

// Progress-driven — snake length grows with progress
<SnakeLoader progress={0.6} />

// Neon preset
<SnakeLoader theme="neon" />

// Full custom
<SnakeLoader
  theme="custom"
  cols={24}
  rows={12}
  speed={10}
  cellSize={14}
  colors={{ snake: "#00ff88", food: "#ff3366", background: "#000" }}
  effects={{ glow: 16, trail: 200, scanlines: true }}
/>
```

## Props

| Prop             | Type                                                     | Default   | Description                                           |
| ---------------- | -------------------------------------------------------- | --------- | ----------------------------------------------------- |
| `progress`       | `number`                                                 | `—`       | 0..1. Omit for indeterminate.                         |
| `theme`          | `"nokia" \| "neon" \| "minimal" \| "custom"`             | `"nokia"` | Preset. `custom` = no baked styling.                  |
| `cols`           | `number`                                                 | `20`      | Grid columns.                                         |
| `rows`           | `number`                                                 | `10`      | Grid rows.                                            |
| `cellSize`       | `number`                                                 | `12`      | Cell size in px.                                      |
| `speed`          | `number`                                                 | `8`       | Cells per second.                                     |
| `initialLength`  | `number`                                                 | `3`       | Starting snake length.                                |
| `growthPerFood`  | `number`                                                 | `1`       | Cells gained per food.                                |
| `colors`         | `{ snake?, snakeHead?, food?, grid?, background?, glow?, trailColor? }` | `—` | Color tokens. Override preset.            |
| `effects`        | `{ glow?, trail?, scanlines?, pixelated?, pulse?, cornerRadius? }` | `—` | Effect tokens. Override preset.            |
| `showScore`      | `boolean`                                                | `false`   | Show score.                                           |
| `label`          | `string`                                                 | `—`       | Text under grid + aria-label.                         |
| `frame`          | `{ show?, color?, borderRadius?, padding? }`             | `—`       | Optional bezel chrome.                                |
| `paused`         | `boolean`                                                | `false`   | Pause the tick loop.                                  |
| `className`      | `string`                                                 | `—`       | Pass-through.                                         |

All visual tokens are also exposed as CSS variables (`--snake-loader-snake`, `--snake-loader-glow`, etc.) so you can theme via stylesheet.

## Accessibility

- `role="progressbar"` with `aria-valuenow` when `progress` is provided; `aria-busy="true"` when indeterminate.
- Respects `prefers-reduced-motion` — slower tick, no pulse/trail/flicker.

## License

MIT © [Jakub Šalmík](https://jakubsalmik.com)
