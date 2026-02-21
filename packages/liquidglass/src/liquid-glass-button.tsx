import React, { useRef, useEffect, useState, useId, forwardRef } from "react";
import gsap from "gsap";
import { cn } from "./utils";
import { generateGlassMaps } from "./generate-displacement-map";

const PADDING_PCT = 50;

export interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button width in px */
  width?: number;
  /** Button height in px */
  height?: number;
  /** Border radius in px */
  radius?: number;
  /** Edge thickness of the glass refraction (shader param) */
  edgeSize?: number;
  /** Edge intensity of the glass refraction (shader param) */
  intensity?: number;
  /** Blur applied to the displacement map (higher = softer transitions) */
  smoothness?: number;
  /** Normal scale in the shader (higher = more warped background) */
  distortion?: number;
  /** RGB channel separation - chromatic aberration amount */
  chroma?: number;
  /** Background color of the glass */
  glassColor?: string;
  /** feDisplacementMap scale - how much the background refracts */
  displacement?: number;
  /** Gaussian blur applied to the background */
  blur?: number;
  /** Saturation boost applied to the final result (1 = normal) */
  saturation?: number;
  /** Scale multiplier on hover */
  hoverScale?: number;
  /** Displacement scale on hover */
  hoverDisplacement?: number;
  /** Blur amount on hover */
  hoverBlur?: number;
  /** Chroma multiplier on hover (applied to chroma prop) */
  hoverChromaMultiplier?: number;
  /** Duration of hover animation in seconds */
  hoverDuration?: number;
  /** Disable all GSAP animations */
  disableAnimation?: boolean;
}

export const LiquidGlassButton = forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  function LiquidGlassButton({
    children, className, style,
    width = 300,
    height = 56,
    radius = 60,
    edgeSize,
    intensity,
    smoothness = 1,
    distortion,
    chroma = 3,
    glassColor = "rgba(255,255,255,0.05)",
    displacement = 35,
    blur = 2,
    saturation = 1.2,
    hoverScale = 1.05,
    hoverDisplacement = 65,
    hoverBlur = 4,
    hoverChromaMultiplier = 2.5,
    hoverDuration = 0.4,
    disableAnimation = false,
    ...props
  }, ref) {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref as React.RefObject<HTMLButtonElement>) ?? internalRef;

    const blurRef = useRef<SVGFEGaussianBlurElement>(null);
    const displacerR = useRef<SVGFEDisplacementMapElement>(null);
    const displacerG = useRef<SVGFEDisplacementMapElement>(null);
    const displacerB = useRef<SVGFEDisplacementMapElement>(null);

    const filterId = "lg" + useId().replace(/:/g, "");

    const [maps, setMaps] = useState<ReturnType<typeof generateGlassMaps> | null>(null);

    useEffect(() => {
      let cancelled = false;
      const m = generateGlassMaps({ width, height, radius, edgeSize, intensity, distortion });
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setMaps(m);
      };
      img.src = m.displacement;
      return () => { cancelled = true; };
    }, [width, height, radius, edgeSize, intensity, distortion]);

    useEffect(() => {
      const button = buttonRef.current;
      if (!button || !blurRef.current || disableAnimation) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const fx = {
        displacement: displacement,
        blur: blur,
        chroma: chroma
      };

      const sync = () => {
        displacerR.current?.setAttribute("scale", (fx.displacement + fx.chroma).toString());
        displacerG.current?.setAttribute("scale", fx.displacement.toString());
        displacerB.current?.setAttribute("scale", (fx.displacement - fx.chroma).toString());
        blurRef.current?.setAttribute("stdDeviation", fx.blur.toString());
      };

      sync();

      const onEnter = () => {
        gsap.killTweensOf([fx, button]);
        gsap.to(fx, {
          displacement: hoverDisplacement,
          blur: hoverBlur,
          chroma: chroma * hoverChromaMultiplier,
          duration: hoverDuration,
          ease: "power3.out",
          onUpdate: sync
        });
        gsap.to(button, { scale: hoverScale, duration: hoverDuration, ease: "power3.out" });
      };

      const onLeave = () => {
        gsap.killTweensOf([fx, button]);
        gsap.to(fx, {
          displacement: displacement,
          blur: blur,
          chroma: chroma,
          duration: hoverDuration,
          ease: "power2.out",
          onUpdate: sync
        });
        gsap.to(button, { scale: 1, duration: hoverDuration, ease: "power2.out" });
      };

      const onClick = () => {
        gsap.killTweensOf(button);
        const cur = gsap.getProperty(button, "scale") as number;
        gsap.timeline()
          .to(button, { scale: cur * 0.95, duration: 0.1, ease: "power2.in" })
          .to(button, { scale: hoverScale, duration: 0.3, ease: "back.out(2)" });
      };

      button.addEventListener("pointerenter", onEnter);
      button.addEventListener("pointerleave", onLeave);
      button.addEventListener("click", onClick);

      return () => {
        button.removeEventListener("pointerenter", onEnter);
        button.removeEventListener("pointerleave", onLeave);
        button.removeEventListener("click", onClick);
        gsap.killTweensOf([button, fx]);
      };
    }, [buttonRef, maps, chroma, displacement, blur, hoverScale, hoverDisplacement, hoverBlur, hoverChromaMultiplier, hoverDuration, disableAnimation]);

    if (!maps) return null;

    return (
      <>
        <button
          ref={buttonRef}
          className={cn("relative overflow-hidden shadow-2xl shadow-black/20 cursor-pointer", className)}
          style={{ width, height, borderRadius: radius, border: "none", background: glassColor, ...style }}
          {...props}
        >
          <div
            className="absolute inset-0 z-0"
            style={{
              borderRadius: "inherit",
              backdropFilter: `url(#${filterId})`,
              WebkitBackdropFilter: `url(#${filterId})`,
              willChange: "backdrop-filter",
              transform: "translateZ(0)",
            }}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.0) 100%)", borderRadius: "inherit" }}>
            {children}
          </div>
        </button>

        <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id={filterId} x={`-${PADDING_PCT}%`} y={`-${PADDING_PCT}%`} width={`${100 + PADDING_PCT * 2}%`} height={`${100 + PADDING_PCT * 2}%`} colorInterpolationFilters="sRGB">
              <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation={blur} result="blurred_bg" edgeMode="duplicate" />

              <feImage href={maps.displacement} result="disp_map" x={`${PADDING_PCT}%`} y={`${PADDING_PCT}%`} width={`${100}%`} height={`${100}%`} preserveAspectRatio="none" />

              <feGaussianBlur in="disp_map" stdDeviation={smoothness} result="disp_blurred" edgeMode="duplicate" />

              <feDisplacementMap ref={displacerR} in="blurred_bg" in2="disp_blurred" scale={displacement + chroma} xChannelSelector="R" yChannelSelector="G" result="displaced_r" />
              <feColorMatrix in="displaced_r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red_channel" />

              <feDisplacementMap ref={displacerG} in="blurred_bg" in2="disp_blurred" scale={displacement} xChannelSelector="R" yChannelSelector="G" result="displaced_g" />
              <feColorMatrix in="displaced_g" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green_channel" />

              <feDisplacementMap ref={displacerB} in="blurred_bg" in2="disp_blurred" scale={displacement - chroma} xChannelSelector="R" yChannelSelector="G" result="displaced_b" />
              <feColorMatrix in="displaced_b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue_channel" />

              <feBlend in="red_channel" in2="green_channel" mode="screen" result="rg_channels" />
              <feBlend in="rg_channels" in2="blue_channel" mode="screen" result="rgb_channels" />

              <feColorMatrix in="rgb_channels" type="saturate" values={saturation.toString()} result="final" />
            </filter>
          </defs>
        </svg>
      </>
    );
  }
);
