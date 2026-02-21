# Liquid Glass

A React component that creates a stunning **Liquid Glass** UI effect - glassmorphism with real-time refraction, chromatic aberration, and smooth GSAP animations.

Built with SVG filters and WebGL displacement maps.

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
| `className` | `string` | - | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles merged onto the button |
| `ref` | `Ref<HTMLButtonElement>` | - | Forwarded ref to the underlying `<button>` |

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

1. **WebGL Displacement Map** - A GLSL fragment shader computes a displacement map from a signed distance field (SDF) of a rounded rectangle. The WebGL context is cached as a singleton for performance.

2. **SVG Filter Chain** - The displacement map feeds into an SVG `<filter>` that applies per-channel (R/G/B) `feDisplacementMap` at slightly different scales, producing chromatic aberration.

3. **GSAP Animations** - Pointer events drive GSAP tweens that animate displacement scale, blur, chromatic separation, and button scale on each frame.

## Accessibility

- Respects `prefers-reduced-motion` - animations are automatically disabled
- Semantic `<button>` element - fully keyboard navigable
- Supports all ARIA attributes

## Running the Demo

```bash
git clone https://github.com/MarcosDemik/liquidglass.git
cd liquidglass
npm install
npm run dev
```

The demo runs at `http://localhost:3000` with interactive sliders to tweak all parameters in real time.

## Project Structure

```
liquidglass/
├── packages/liquidglass/   ← npm package source
│   ├── src/
│   │   ├── index.ts
│   │   ├── liquid-glass-button.tsx
│   │   ├── generate-displacement-map.ts
│   │   └── utils.ts
│   ├── package.json
│   └── tsup.config.ts
└── demo/                   ← Next.js demo app
    ├── app/
    └── package.json
```

## Acknowledgments

The core glass refraction concept is inspired by [rahuldotdev](https://github.com/rahuldotdev)'s liquid glass button implementation.

## License

MIT
