import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once, here, rather than in every component that animates.
gsap.registerPlugin(ScrollTrigger);

/**
 * Breakpoints for gsap.matchMedia(). Kept in one place so the whole site agrees.
 *
 * 1024px, not 768px: every layout these branches drive is written with Tailwind's
 * `lg:` prefix, and `tailwind.config.ts` only overrides `screens` inside
 * `container`, so `lg` is still the default 1024px. At 768–1023px (iPad portrait
 * is 820px) a 768px "desktop" branch ran its animation against a layout that was
 * still in its mobile form — Home dimmed three of four `[data-why-step]`
 * paragraphs with no sticky panel to ever un-dim them, and the category band
 * pinned itself while `overflow: hidden` killed native swipe. Match the CSS.
 */
export const MEDIA = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
} as const;

/**
 * House easing. Exponential ease-out — confident deceleration, no bounce,
 * no elastic (both read as dated and pull attention to the animation itself).
 */
export const EASE = "power3.out";

export { gsap, ScrollTrigger };
