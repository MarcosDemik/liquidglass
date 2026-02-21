"use client";

import { useState } from "react";
import { LiquidGlassButton } from "@marcosdemik/liquidglass";

const PRESETS = [
  { label: "Pill (320×60)", width: 320, height: 60, radius: 60 },
  { label: "Square (60×60)", width: 60, height: 60, radius: 16 },
  { label: "Circle (80×80)", width: 80, height: 80, radius: 9999 },
  { label: "Wide (400×48)", width: 400, height: 48, radius: 24 },
  { label: "Tall (80×200)", width: 80, height: 200, radius: 40 },
];

export default function Home() {
  const [w, setW] = useState(320);
  const [h, setH] = useState(60);
  const [r, setR] = useState(60);
  const [edgeSize, setEdgeSize] = useState(40);
  const [intensity, setIntensity] = useState(1.0);
  const [smoothness, setSmoothness] = useState(1.0);
  const [distortion, setDistortion] = useState(15.0);
  const [chroma, setChroma] = useState(3.0);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1920&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />
      <div className="absolute inset-0 -z-10 bg-black/30" />

      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg select-none">
          Liquid Glass
        </h1>

        {/* Controls */}
        <div className="flex gap-4 items-center flex-wrap justify-center max-w-4xl px-4 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Width: {w}
            <input type="range" min={40} max={500} value={w} onChange={(e) => setW(+e.target.value)} className="w-full accent-white" />
          </label>
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Height: {h}
            <input type="range" min={40} max={300} value={h} onChange={(e) => setH(+e.target.value)} className="w-full accent-white" />
          </label>
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Radius: {r}
            <input type="range" min={0} max={200} value={r} onChange={(e) => setR(+e.target.value)} className="w-full accent-white" />
          </label>
          <div className="w-[1px] h-8 bg-white/20 mx-2" />
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Edge Size: {edgeSize}
            <input type="range" min={0} max={150} value={edgeSize} onChange={(e) => setEdgeSize(+e.target.value)} className="w-full accent-white" />
          </label>
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Intensity: {intensity.toFixed(1)}
            <input type="range" min={0.1} max={5} step={0.1} value={intensity} onChange={(e) => setIntensity(+e.target.value)} className="w-full accent-white" />
          </label>
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Distortion: {distortion.toFixed(1)}
            <input type="range" min={0} max={50} step={0.5} value={distortion} onChange={(e) => setDistortion(+e.target.value)} className="w-full accent-white" />
          </label>
          <div className="w-[1px] h-8 bg-white/20 mx-2" />
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Chroma: {chroma.toFixed(1)}
            <input type="range" min={0} max={20} step={0.5} value={chroma} onChange={(e) => setChroma(+e.target.value)} className="w-full accent-white" />
          </label>
          <label className="text-white text-xs flex flex-col items-center gap-1 w-24">
            Softness: {smoothness}
            <input type="range" min={0} max={20} step={0.1} value={smoothness} onChange={(e) => setSmoothness(+e.target.value)} className="w-full accent-white" />
          </label>
        </div>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setW(p.width); setH(p.height); setR(p.radius); }}
              className="px-3 py-1 text-xs text-white/80 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Dynamic button */}
        <div className="mt-8">
          <LiquidGlassButton width={w} height={h} radius={r} edgeSize={edgeSize} intensity={intensity} smoothness={smoothness} distortion={distortion} chroma={chroma}>
            Liquid Glass
          </LiquidGlassButton>
        </div>

        {/* Fixed presets for comparison */}
        <div className="flex gap-6 items-center mt-4">
          <LiquidGlassButton width={60} height={60} radius={16} className="text-xl">
            +
          </LiquidGlassButton>
          <LiquidGlassButton width={80} height={80} radius={9999}>
            ▶
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  );
}
