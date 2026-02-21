import React, { useRef, useEffect, useState, useId, forwardRef } from "react";
import gsap from "gsap";
import { cn } from "./utils";
import { generateGlassMaps, getCachedGlassMaps, revokeGlassMaps } from "./generate-displacement-map";

export interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button width in px */
  width?: number;
  /** Button height in px */
  height?: number;
  /** Border radius in px */
  radius?: number;
  /** Edge thickness of the glass refraction zone */
  edgeSize?: number;
  /** Edge refraction intensity (0-1) */
  intensity?: number;
  /** Specular rim thickness relative to size (0-1) */
  specularWidth?: number;
  /** feDisplacementMap scale - how much the background refracts */
  displacement?: number;
  /** Gaussian blur applied to the background */
  blur?: number;
  /** Saturation applied to the displaced result */
  saturation?: number;
  /** Brightness boost on the backdrop-filter (1 = normal) */
  brightness?: number;
  /** Background tint color of the glass */
  glassColor?: string;
  /** Scale multiplier on hover */
  hoverScale?: number;
  /** Displacement scale on hover */
  hoverDisplacement?: number;
  /** Blur amount on hover */
  hoverBlur?: number;
  /** Duration of hover animation in seconds */
  hoverDuration?: number;
  /** Disable all GSAP animations */
  disableAnimation?: boolean;
  /** Supersampling quality for the displacement map (default 2, higher = smoother) */
  quality?: number;
}

export const LiquidGlassButton = forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  function LiquidGlassButton({
    children, className, style,
    width = 300,
    height = 56,
    radius = 60,
    edgeSize = 30,
    intensity = 0.7,
    specularWidth = 0.02,
    displacement = 55,
    blur = 1,
    saturation = 150,
    brightness = 1.1,
    glassColor = "transparent",
    hoverScale = 1.08,
    hoverDisplacement = 125,
    hoverBlur = 4,
    hoverDuration = 0.25,
    disableAnimation = false,
    quality = 2,
    ...props
  }, ref) {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref as React.RefObject<HTMLButtonElement>) ?? internalRef;

    const displacerRef = useRef<SVGFEDisplacementMapElement>(null);
    const blurRef = useRef<SVGFEGaussianBlurElement>(null);

    const filterId = "lg" + useId().replace(/:/g, "");

    const mapOpts = { width, height, radius, edgeSize, intensity, specularWidth, quality };
    const [maps, setMaps] = useState<{ displacement: string; specular: string } | null>(
      () => getCachedGlassMaps(mapOpts),
    );

    useEffect(() => {
      // If already have maps from cache, skip
      const cached = getCachedGlassMaps(mapOpts);
      if (cached) {
        setMaps(cached);
        return;
      }

      let cancelled = false;
      generateGlassMaps(mapOpts).then((m) => {
        if (!cancelled) setMaps(m);
      });

      return () => { cancelled = true; };
    }, [width, height, radius, edgeSize, intensity, specularWidth, quality]);

    useEffect(() => {
      return () => {
        if (maps) revokeGlassMaps(maps);
      };
    }, [maps]);

    useEffect(() => {
      const button = buttonRef.current;
      const displacer = displacerRef.current;
      const blurEl = blurRef.current;
      if (!button || !displacer || !blurEl || disableAnimation) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const fx = {
        displacement: displacement,
        blur: blur,
      };

      const sync = () => {
        displacer.setAttribute("scale", fx.displacement.toString());
        blurEl.setAttribute("stdDeviation", fx.blur.toString());
      };

      sync();

      const onEnter = () => {
        gsap.killTweensOf([fx, button]);
        gsap.to(fx, {
          displacement: hoverDisplacement,
          blur: hoverBlur,
          duration: hoverDuration,
          ease: "back.out(1.4)",
          onUpdate: sync,
        });
        gsap.to(button, {
          scale: hoverScale,
          duration: hoverDuration,
          ease: "back.out(1.4)",
        });
      };

      const onLeave = () => {
        gsap.killTweensOf([fx, button]);
        gsap.to(fx, {
          displacement: displacement,
          blur: blur,
          duration: hoverDuration,
          ease: "power2.out",
          onUpdate: sync,
        });
        gsap.to(button, {
          scale: 1,
          duration: hoverDuration,
          ease: "power2.out",
        });
      };

      const onClick = () => {
        gsap.killTweensOf(button);
        const cur = gsap.getProperty(button, "scale") as number;
        gsap.timeline()
          .to(button, { scale: cur * 0.92, duration: 0.08, ease: "power2.in" })
          .to(button, { scale: hoverScale, duration: 0.25, ease: "back.out(2)" });
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
    }, [buttonRef, maps, displacement, blur, hoverScale, hoverDisplacement, hoverBlur, hoverDuration, disableAnimation]);

    if (!maps) return null;

    return (
      <>
        <button
          ref={buttonRef}
          className={cn("relative overflow-hidden shadow-lg cursor-pointer", className)}
          style={{ width, height, borderRadius: radius, border: "none", background: glassColor, ...style }}
          {...props}
        >
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `url(#${filterId}) brightness(${brightness * 100}%)`,
              WebkitBackdropFilter: `url(#${filterId}) brightness(${brightness * 100}%)`,
              borderRadius: "inherit",
              willChange: "backdrop-filter",
              transform: "translateZ(0)",
            }}
          />
          <div
            className="absolute inset-0 inline-flex items-center justify-center font-bold text-white"
            style={{ background: "hsl(0 100% 100% / 15%)", borderRadius: "inherit" }}
          >
            {children}
          </div>
        </button>

        <svg
          colorInterpolationFilters="sRGB"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
          aria-hidden="true"
        >
          <defs>
            <filter id={filterId}>
              <feGaussianBlur
                ref={blurRef}
                in="SourceGraphic"
                stdDeviation={blur}
                result="blurred_source"
              />
              <feImage
                href={maps.displacement}
                x="0"
                y="0"
                width={width}
                height={height}
                result="displacement_map"
              />
              <feDisplacementMap
                ref={displacerRef}
                in="blurred_source"
                in2="displacement_map"
                scale={displacement}
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              <feColorMatrix
                in="displaced"
                type="saturate"
                result="displaced_saturated"
                values={saturation.toString()}
              />
              <feImage
                href={maps.specular}
                x="0"
                y="0"
                width={width}
                height={height}
                result="specular_layer"
              />
              <feGaussianBlur
                in="specular_layer"
                stdDeviation="1"
                result="blurred_specular_layer"
              />
              <feComposite
                in="displaced_saturated"
                in2="blurred_specular_layer"
                operator="in"
                result="final_specular_layer"
              />
              <feBlend
                in="final_specular_layer"
                in2="displaced"
                mode="normal"
              />
            </filter>
          </defs>
        </svg>
      </>
    );
  }
);
