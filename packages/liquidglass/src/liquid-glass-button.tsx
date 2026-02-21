import React, { useRef, useEffect, useState, useId, forwardRef } from "react";
import gsap from "gsap";
import { cn } from "./utils";
import { generateGlassMaps } from "./generate-displacement-map";

const CONFIG = {
  initial: { scale: 1, displacement: 35, blur: 2, chroma: 3 },
  hover: { scale: 1.05, displacement: 65, blur: 4, chroma: 10 },
  click: { scaleDown: 0.95, scaleUp: 1.05 },
  duration: { hover: 0.4, clickDown: 0.1, clickUp: 0.3 },
  ease: {
    hover: "power3.out",
    hoverOut: "power2.out",
    clickDown: "power2.in",
    clickUp: "back.out(2)",
  },
} as const;

const PADDING = 60;

export interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  width?: number;
  height?: number;
  radius?: number;
  edgeSize?: number;
  intensity?: number;
  smoothness?: number;
  distortion?: number;
  chroma?: number;
  glassColor?: string;
}

export const LiquidGlassButton = forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  function LiquidGlassButton({ children, className, width = 300, height = 56, radius = 60, edgeSize, intensity, smoothness = 1, distortion, chroma = 3, glassColor = "rgba(255,255,255,0.05)", style, ...props }, ref) {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref as React.RefObject<HTMLButtonElement>) ?? internalRef;

    const blurRef = useRef<SVGFEGaussianBlurElement>(null);
    const displacerR = useRef<SVGFEDisplacementMapElement>(null);
    const displacerG = useRef<SVGFEDisplacementMapElement>(null);
    const displacerB = useRef<SVGFEDisplacementMapElement>(null);

    const filterId = "lg" + useId().replace(/:/g, "");

    const [maps, setMaps] = useState<{ displacement: string } | null>(null);

    useEffect(() => {
      const result = generateGlassMaps({ width, height, radius, edgeSize, intensity, distortion });
      setMaps(result);
    }, [width, height, radius, edgeSize, intensity, distortion]);

    useEffect(() => {
      const button = buttonRef.current;
      if (!button || !blurRef.current) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const fx = {
        displacement: CONFIG.initial.displacement,
        blur: CONFIG.initial.blur,
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
          displacement: CONFIG.hover.displacement,
          blur: CONFIG.hover.blur,
          chroma: chroma * 2.5,
          duration: CONFIG.duration.hover,
          ease: CONFIG.ease.hover,
          onUpdate: sync
        });
        gsap.to(button, { scale: CONFIG.hover.scale, duration: CONFIG.duration.hover, ease: CONFIG.ease.hover });
      };

      const onLeave = () => {
        gsap.killTweensOf([fx, button]);
        gsap.to(fx, {
          displacement: CONFIG.initial.displacement,
          blur: CONFIG.initial.blur,
          chroma: chroma,
          duration: CONFIG.duration.hover,
          ease: CONFIG.ease.hoverOut,
          onUpdate: sync
        });
        gsap.to(button, { scale: CONFIG.initial.scale, duration: CONFIG.duration.hover, ease: CONFIG.ease.hoverOut });
      };

      const onClick = () => {
        gsap.killTweensOf(button);
        const cur = gsap.getProperty(button, "scale") as number;
        gsap.timeline()
          .to(button, { scale: cur * CONFIG.click.scaleDown, duration: CONFIG.duration.clickDown, ease: CONFIG.ease.clickDown })
          .to(button, { scale: CONFIG.click.scaleUp, duration: CONFIG.duration.clickUp, ease: CONFIG.ease.clickUp });
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
    }, [buttonRef, maps, chroma]);

    return (
      <>
        <button
          ref={buttonRef}
          className={cn("relative overflow-hidden shadow-2xl shadow-black/20 cursor-pointer", className)}
          style={{ width, height, borderRadius: radius, border: "none", background: glassColor, ...style }}
          {...props}
        >
          <div
            className="absolute z-0"
            style={{
              top: -PADDING, left: -PADDING, right: -PADDING, bottom: -PADDING,
              backdropFilter: `url(#${filterId})`,
              WebkitBackdropFilter: `url(#${filterId})`
            }}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.0) 100%)", borderRadius: "inherit" }}>
            {children}
          </div>
        </button>

        <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation={CONFIG.initial.blur} result="blurred_bg" edgeMode="duplicate" />

              {maps && (
                <>
                  <feImage href={maps.displacement} result="disp_map" x={PADDING} y={PADDING} width={width} height={height} preserveAspectRatio="none" />

                  <feGaussianBlur in="disp_map" stdDeviation={smoothness} result="disp_blurred" edgeMode="duplicate" />

                  <feDisplacementMap ref={displacerR} in="blurred_bg" in2="disp_blurred" scale={CONFIG.initial.displacement + chroma} xChannelSelector="R" yChannelSelector="G" result="displaced_r" />
                  <feColorMatrix in="displaced_r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red_channel" />

                  <feDisplacementMap ref={displacerG} in="blurred_bg" in2="disp_blurred" scale={CONFIG.initial.displacement} xChannelSelector="R" yChannelSelector="G" result="displaced_g" />
                  <feColorMatrix in="displaced_g" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green_channel" />

                  <feDisplacementMap ref={displacerB} in="blurred_bg" in2="disp_blurred" scale={CONFIG.initial.displacement - chroma} xChannelSelector="R" yChannelSelector="G" result="displaced_b" />
                  <feColorMatrix in="displaced_b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue_channel" />

                  <feBlend in="red_channel" in2="green_channel" mode="screen" result="rg_channels" />
                  <feBlend in="rg_channels" in2="blue_channel" mode="screen" result="rgb_channels" />

                  <feColorMatrix in="rgb_channels" type="saturate" values="1.2" result="final" />
                </>
              )}
            </filter>
          </defs>
        </svg>
      </>
    );
  }
);
