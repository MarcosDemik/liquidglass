# @marcosdemik/liquidglass

A React component that creates a stunning **Liquid Glass** UI effect — glassmorphism with real-time refraction, chromatic aberration, and smooth GSAP animations.

Built with SVG filters and WebGL displacement maps.

https://github.com/marcosdemik/liquidglass

## Install

```bash
npm install @marcosdemik/liquidglass
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
| `className` | `string` | — | Additional CSS classes for the button |
| `style` | `CSSProperties` | — | Inline styles merged onto the button |
| `ref` | `Ref<HTMLButtonElement>` | — | Forwarded ref to the underlying `<button>` |

All standard `<button>` HTML attributes (`onClick`, `disabled`, `aria-label`, etc.) are also supported.

## Examples

### Pill Button (default)

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
  ▶
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
<LiquidGlassButton width={320} height={60} radius={60} distortion={30} chroma={8} intensity={2}>
  Distorted
</LiquidGlassButton>
```

### Subtle Glass

```tsx
<LiquidGlassButton width={320} height={60} radius={60} distortion={5} chroma={1} smoothness={3}>
  Subtle
</LiquidGlassButton>
```

## How It Works

The effect is built from three layers:

1. **WebGL Displacement Map** — A GLSL fragment shader computes a displacement map from a signed distance field (SDF) of a rounded rectangle. The shader runs on an offscreen canvas and outputs a PNG data URL. The WebGL context is cached as a singleton for performance.

2. **SVG Filter Chain** — The displacement map feeds into an SVG `<filter>` that applies per-channel (R/G/B) `feDisplacementMap` at slightly different scales, producing chromatic aberration. Channels are recombined with `feBlend mode="screen"`. A padding constant expands the backdrop-filter area beyond the button bounds to prevent edge artifacts.

3. **GSAP Animations** — Pointer events drive GSAP tweens that animate displacement scale, blur, chromatic separation, and button scale. The `sync()` callback directly mutates SVG filter element attributes on each frame for maximum performance.

## Accessibility

- Respects `prefers-reduced-motion` — all animations are automatically disabled when the user has reduced motion enabled
- Uses semantic `<button>` element — fully keyboard navigable
- Supports all ARIA attributes via standard button props

## Requirements

- React 18+ (uses `useId` hook)
- A browser with WebGL support

## Acknowledgments

The core glass refraction concept is inspired by [rahuldotdev](https://github.com/rahuldotdev)'s liquid glass button implementation.

## License

MIT
