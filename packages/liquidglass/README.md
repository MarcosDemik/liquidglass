# @marcosdemik/liquidglass

[![npm version](https://img.shields.io/npm/v/@marcosdemik/liquidglass.svg)](https://www.npmjs.com/package/@marcosdemik/liquidglass)
[![npm downloads](https://img.shields.io/npm/dm/@marcosdemik/liquidglass.svg)](https://www.npmjs.com/package/@marcosdemik/liquidglass)
[![license](https://img.shields.io/npm/l/@marcosdemik/liquidglass.svg)](https://github.com/MarcosDemik/liquidglass/blob/main/LICENSE)

A React component that creates a **Liquid Glass** UI effect - glassmorphism with real-time refraction, chromatic aberration, and smooth GSAP animations.

Built with SVG filters and WebGL displacement maps.

[GitHub](https://github.com/MarcosDemik/liquidglass)

---

## Install

```bash
# npm
npm install @marcosdemik/liquidglass

# yarn
yarn add @marcosdemik/liquidglass

# pnpm
pnpm add @marcosdemik/liquidglass
```

## Quick Start

```tsx
import { LiquidGlassButton } from "@marcosdemik/liquidglass";

function App() {
  return (
    <LiquidGlassButton width={320} height={60} radius={60} chroma={3}>
      Click me
    </LiquidGlassButton>
  );
}
```

## Works With

- Next.js (App Router & Pages Router)
- Vite + React
- Remix
- Gatsby
- Any React 18+ project

The component includes a `"use client"` directive, so it works out of the box with Server Components.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `300` | Button width in pixels |
| `height` | `number` | `56` | Button height in pixels |
| `radius` | `number` | `60` | Border radius in pixels |
| `edgeSize` | `number` | `40` | Size of the glass edge refraction zone |
| `intensity` | `number` | `1.0` | Refraction intensity multiplier |
| `smoothness` | `number` | `1.0` | Blur applied to the displacement map (softens edges) |
| `distortion` | `number` | `15.0` | Normal map distortion scale |
| `chroma` | `number` | `3` | Chromatic aberration strength (RGB channel offset) |
| `glassColor` | `string` | `"rgba(255,255,255,0.05)"` | Background tint color of the glass |
| `className` | `string` | | Additional CSS classes |
| `style` | `CSSProperties` | | Inline styles merged onto the button |
| `ref` | `Ref<HTMLButtonElement>` | | Forwarded ref to the underlying button |

All standard `<button>` HTML attributes (`onClick`, `disabled`, `aria-label`, etc.) are also supported.

## Examples

### Pill Button

```tsx
<LiquidGlassButton width={320} height={60} radius={60}>
  Get Started
</LiquidGlassButton>
```

### Square Icon Button

```tsx
<LiquidGlassButton width={60} height={60} radius={16} className="text-xl">
  +
</LiquidGlassButton>
```

### Circle Button

```tsx
<LiquidGlassButton width={80} height={80} radius={9999}>
  Play
</LiquidGlassButton>
```

### Wide Navigation Bar

```tsx
<LiquidGlassButton width={400} height={48} radius={24}>
  Navigation
</LiquidGlassButton>
```

### High Distortion

```tsx
<LiquidGlassButton
  width={320}
  height={60}
  radius={60}
  distortion={30}
  chroma={8}
  intensity={2}
>
  Distorted
</LiquidGlassButton>
```

### Subtle Glass

```tsx
<LiquidGlassButton
  width={320}
  height={60}
  radius={60}
  distortion={5}
  chroma={1}
  smoothness={3}
>
  Subtle
</LiquidGlassButton>
```

### With onClick Handler

```tsx
<LiquidGlassButton
  width={200}
  height={50}
  radius={30}
  onClick={() => console.log("clicked!")}
>
  Click me
</LiquidGlassButton>
```

### Custom Glass Color

```tsx
<LiquidGlassButton
  width={320}
  height={60}
  radius={60}
  glassColor="rgba(0, 150, 255, 0.1)"
>
  Blue Glass
</LiquidGlassButton>
```

## How It Works

The effect is built from three layers:

1. **WebGL Displacement Map** - A GLSL fragment shader computes a displacement map from a signed distance field (SDF) of a rounded rectangle. The shader runs on an offscreen canvas and outputs a PNG data URL. The WebGL context is cached as a singleton for performance.

2. **SVG Filter Chain** - The displacement map feeds into an SVG `<filter>` that applies per-channel (R/G/B) `feDisplacementMap` at slightly different scales, producing chromatic aberration. Channels are recombined with `feBlend mode="screen"`.

3. **GSAP Animations** - Pointer events drive GSAP tweens that animate displacement scale, blur, chromatic separation, and button scale. Filter attributes are mutated directly each frame for maximum performance.

## Accessibility

- Respects `prefers-reduced-motion` - all animations are automatically disabled
- Semantic `<button>` element - fully keyboard navigable
- Supports all ARIA attributes via standard button props

## Requirements

- React 18+ (uses `useId` hook)
- Browser with WebGL support

## Acknowledgments

The core glass refraction concept is inspired by [rahuldotdev](https://github.com/rahuldotdev)'s liquid glass button implementation.

## License

MIT
