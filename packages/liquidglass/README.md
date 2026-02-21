# @marcosdemik/liquidglass

[![npm version](https://img.shields.io/npm/v/@marcosdemik/liquidglass.svg)](https://www.npmjs.com/package/@marcosdemik/liquidglass)
[![npm downloads](https://img.shields.io/npm/dm/@marcosdemik/liquidglass.svg)](https://www.npmjs.com/package/@marcosdemik/liquidglass)
[![license](https://img.shields.io/npm/l/@marcosdemik/liquidglass.svg)](https://github.com/MarcosDemik/liquidglass/blob/main/LICENSE)

A React component that creates a **Liquid Glass** UI effect with real-time refraction, specular highlights, and smooth GSAP animations.

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
    <LiquidGlassButton width={320} height={60} radius={60}>
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
| `glassColor` | `string` | `"transparent"` | Background tint color of the glass |

### Glass Effect

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `displacement` | `number` | `55` | How much the background refracts (feDisplacementMap scale) |
| `blur` | `number` | `1` | Gaussian blur applied to the background |
| `saturation` | `number` | `150` | Color saturation of the refracted result (feColorMatrix saturate value) |
| `brightness` | `number` | `1.1` | Brightness boost on the backdrop-filter (1 = normal) |
| `intensity` | `number` | `0.7` | Refraction intensity at the glass edge (0-1) |
| `edgeSize` | `number` | `30` | Thickness of the glass edge refraction zone in pixels |
| `specularWidth` | `number` | `0.02` | Specular rim thickness relative to the smallest dimension (0-1) |
| `quality` | `number` | `2` | Supersampling multiplier for the displacement map (higher = smoother gradients) |

### Hover Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hoverScale` | `number` | `1.08` | Scale multiplier on hover |
| `hoverDisplacement` | `number` | `125` | Displacement scale on hover |
| `hoverBlur` | `number` | `4` | Blur amount on hover |
| `hoverDuration` | `number` | `0.25` | Duration of hover animation in seconds |
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

### High Refraction

```tsx
<LiquidGlassButton
  width={320}
  height={60}
  radius={60}
  displacement={100}
  intensity={1}
  edgeSize={50}
  saturation={200}
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
  displacement={25}
  blur={1}
  intensity={0.4}
  edgeSize={15}
  saturation={120}
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
  hoverScale={1.12}
  hoverDisplacement={150}
  hoverBlur={6}
  hoverDuration={0.4}
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

1. **WebGL Displacement + Specular Maps** - A GLSL fragment shader (highp precision) computes a displacement map and a specular highlight map from a signed distance field (SDF) of a rounded rectangle. 3D surface normals are derived from the SDF to create realistic light refraction at the edges. Maps are rendered at `quality`x resolution (default 2x) for smoother gradients, output as Blob URLs via `toBlob()`, and cached by parameters so multiple instances with the same props share a single set of maps.

2. **SVG Filter Chain** - The displacement map feeds into an SVG `<filter>` with `feDisplacementMap` for background refraction, `feColorMatrix` for saturation control, and `feBlend` to composite the specular highlight layer on top. A `brightness()` function in the backdrop-filter adds a subtle glow.

3. **GSAP Animations** - Pointer events drive GSAP tweens that animate displacement scale, blur, and button scale. Filter attributes are mutated directly each frame for maximum performance.

## Migration from v1.x

v2.0.0 replaced the chromatic aberration pipeline with a specular highlight pipeline for a more realistic glass effect. The following props were removed:

- `chroma` - removed (no more chromatic aberration)
- `distortion` - removed (shader normals are now computed from the SDF)
- `smoothness` - removed (displacement map blur is no longer needed)
- `hoverChromaMultiplier` - removed

New props added:

- `brightness` - controls backdrop brightness (default `1.1`)
- `specularWidth` - controls the specular rim thickness (default `0.02`)
- `quality` - supersampling multiplier for smoother displacement maps (default `2`)

Changed defaults: `displacement` (35 -> 55), `blur` (2 -> 1), `saturation` (1.2 -> 150), `hoverScale` (1.05 -> 1.08), `hoverDisplacement` (65 -> 125), `hoverDuration` (0.4 -> 0.25), `glassColor` ("rgba(255,255,255,0.05)" -> "transparent").

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
