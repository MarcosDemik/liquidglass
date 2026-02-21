# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (Next.js core-web-vitals + TypeScript rules)
```

## Tech Stack

- **Next.js 16** with App Router (all pages under `app/`)
- **React 19** with client components (`"use client"`)
- **Tailwind CSS v4** via PostCSS (imported as `@import "tailwindcss"` in globals.css, uses `@theme inline` for tokens)
- **GSAP** for animations (hover, click, displacement transitions)
- **TypeScript** with strict mode, path alias `@/*` maps to project root

## Architecture

This is a demo/showcase app for a "Liquid Glass" UI effect — a glassmorphism refraction effect built with SVG filters and WebGL.

### Core Pipeline

1. **WebGL displacement map generation** (`lib/generate-displacement-map.ts`): A GLSL fragment shader computes a displacement map from a signed distance field (SDF) of a rounded box. The shader runs on an offscreen `<canvas>` and outputs a PNG data URL. The WebGL context and program are cached as a singleton.

2. **SVG filter chain** (`components/ui/liquid-glass-button.tsx`): The displacement map feeds into an SVG `<filter>` that applies per-channel (R/G/B) `feDisplacementMap` at slightly different scales to produce chromatic aberration. Channels are recombined with `feBlend mode="screen"`. A `PADDING` constant (60px) expands the backdrop-filter area beyond the button bounds to prevent edge artifacts.

3. **GSAP animation** (same file): Pointer events drive GSAP tweens that animate displacement scale, blur, chroma separation, and button scale. The `sync()` callback directly mutates SVG filter element attributes on each frame.

### Key Parameters

The `LiquidGlassButton` component exposes: `width`, `height`, `radius`, `edgeSize`, `intensity`, `smoothness` (blurs the displacement map), `distortion` (shader normal scale), `chroma` (RGB channel offset).

### File Layout

- `app/page.tsx` — Demo page with sliders controlling all glass parameters and shape presets
- `components/ui/` — Reusable UI components (currently `LiquidGlassButton`)
- `lib/generate-displacement-map.ts` — WebGL displacement map generator (SDF shader)
- `lib/utils.ts` — Simple `cn()` classname joiner
