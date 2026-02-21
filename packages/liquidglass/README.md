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

### Shape & Appearance

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `300` | Button width in pixels |
| `height` | `number` | `56` | Button height in pixels |
| `radius` | `number` | `60` | Border radius in pixels |
| `glassColor` | `string` | `"rgba(255,255,255,0.05)"` | Background tint color of the glass |

### Glass Effect

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displacement` | `number` | `35` | How much the background refracts (feDisplacementMap scale) |
| `blur` | `number` | `2` | Gaussian blur applied to the background |
| `chroma` | `number` | `3` | Chromatic aberration strength (RGB channel offset) |
| `saturation` | `number` | `1.2` | Saturation boost on the final result (1 = normal) |
| `distortion` | `number` | `15` | Normal map distortion scale in the shader |
| `intensity` | `number` | `1.0` | Refraction intensity at the glass edge |
| `edgeSize` | `number` | `40` | Thickness of the glass edge refraction zone |
| `smoothness` | `number` | `1.0` | Blur on the displacement map (softens transitions) |

### Hover Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hoverScale` | `number` | `1.05` | Scale multiplier on hover |
| `hoverDisplacement` | `number` | `65` | Displacement scale on hover |
| `hoverBlur` | `number` | `4` | Blur amount on hover |
| `hoverChromaMultiplier` | `number` | `2.5` | Multiplier applied to `chroma` on hover |
| `hoverDuration` | `number` | `0.4` | Duration of hover animation in seconds |
| `disableAnimation` | `boolean` | `false` | Disable all GSAP animations |

### Standard HTML

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `style` | `CSSProperties` | Inline styles merged onto the button |
| `ref` | `Ref<HTMLButtonElement>` | Forwarded ref to the underlying button |

All standard `<button>` HTML attributes (`onClick`, `disabled`, `aria-label`, etc.) are also supported.

## Examples

### Pill Button

```tsx
<LiquidGlassButton width={320} height={60} radius={60}>
  Get Started
</LiquidGlassButton>
```

### Circle Button

```tsx
<LiquidGlassButton width={80} height={80} radius={9999}>
  Play
</LiquidGlassButton>
```

### High Distortion

```tsx
<LiquidGlassButton
  width={320}
  height={60}
  radius={60}
  displacement={60}
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
  displacement={15}
  blur={1}
  distortion={5}
  chroma={1}
  smoothness={3}
>
  Subtle
</LiquidGlassButton>
```

### No Hover Animation

```tsx
<LiquidGlassButton
  width={200}
  height={50}
  radius={30}
  disableAnimation
>
  Static Glass
</LiquidGlassButton>
```

### Custom Hover Behavior

```tsx
<LiquidGlassButton
  width={320}
  height={60}
  radius={60}
  hoverScale={1.1}
  hoverDisplacement={100}
  hoverBlur={6}
  hoverChromaMultiplier={4}
  hoverDuration={0.6}
>
  Strong Hover
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

## Visibility Note

This component returns `null` during SSR and until the displacement map is generated. It always renders at full `opacity: 1` - if you need show/hide behavior (e.g. appear on hover), wrap it in a container with `opacity` control. Use `opacity: 0.01` (not `0`) on the wrapper to keep the browser's GPU compositor layer warm for instant transitions.

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
