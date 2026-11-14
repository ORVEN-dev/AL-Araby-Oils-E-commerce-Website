import { DependencyList, RefObject, useLayoutEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Scoped GSAP setup with guaranteed teardown.
 *
 * This is a SPA: every ScrollTrigger left alive after a route change keeps
 * measuring a detached element, and scroll degrades after a few navigations.
 * `gsap.context()` collects everything created inside `setup` — tweens,
 * timelines, ScrollTriggers, matchMedia — and `ctx.revert()` kills all of it and
 * restores the inline styles GSAP wrote.
 *
 * `@gsap/react`'s useGSAP() does the same thing; it is not a dependency here, so
 * this is the documented equivalent.
 *
 * The scope means selector strings inside `setup` only ever match elements
 * inside this component — ".card" cannot reach across the page.
 */
export const useGsap = (
  setup: (context: gsap.Context) => void,
  scope: RefObject<Element>,
  deps: DependencyList = [],
) => {
  useLayoutEffect(() => {
    const ctx = gsap.context(setup, scope);
    return () => ctx.revert();
    // `setup` is intentionally not a dependency: it is a new closure every
    // render, and including it would tear down and rebuild every ScrollTrigger
    // on each render. Pass anything the animation actually depends on in `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
