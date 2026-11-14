import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useGsap } from "@/hooks/use-gsap";
import { gsap, EASE, MEDIA } from "@/lib/gsap";
// webp, not png: same 1376×768 render, 44KB against the PNG's 1.6MB. This is the
// LCP element and it decodes synchronously, so the PNG's ~4.2MB bitmap sat in
// front of first paint for no visible gain.
import heroFlagship from "@/assets/hero-flagship.webp";
import heroOils from "@/assets/hero-skincare.jpg";
import heroBeauty from "@/assets/hero-beauty.jpg";
import heroHerbs from "@/assets/hero-herbs.jpg";

/**
 * `scrim` is per-slide, not global.
 *
 * Measured, not guessed: each image was composited to a canvas at the hero's real
 * size and the worst-case pixel under the headline box was sampled.
 *
 *   slide       scrim          white h1   gold h1
 *   flagship    .55/.25/.10      15.47      8.14
 *   skincare    .90/.60/.10      11.67      6.14
 *   herbs       .90/.60/.10      10.16      5.34
 *   beauty      .90/.60/.10       8.59      4.52  ← worst case
 *
 * 4.52 clears the 4.5:1 body threshold, never mind the 3:1 a 48–72px headline
 * actually needs. Re-measure if these images are ever swapped.
 *
 * The flagship render is already near-black across its whole left half, so it
 * keeps a light scrim; darkening it further would only mud up the best asset in
 * the project. The three photographs are bright and need the heavy gradient.
 */
const slides = [
  {
    image: heroFlagship,
    alt: "Amber glass oil bottle with a gold cap on dark emerald marble, a ribbon of golden oil spiralling around it among rose petals and rosemary",
    scrim: "bg-gradient-to-r from-black/55 via-black/25 to-transparent",
    priority: true,
  },
  {
    image: heroOils,
    alt: "Premium natural skincare oils and beauty products",
    scrim: "bg-gradient-to-r from-black/90 via-black/60 to-black/10",
    priority: false,
  },
  {
    image: heroBeauty,
    alt: "Beauty and wellness category illustration",
    scrim: "bg-gradient-to-r from-black/90 via-black/60 to-black/10",
    priority: false,
  },
  {
    image: heroHerbs,
    alt: "Natural herbs and aromatherapy products",
    scrim: "bg-gradient-to-r from-black/90 via-black/60 to-black/10",
    priority: false,
  },
];

const HEADLINE = [
  { text: "Natural", accent: false },
  { text: "Beauty", accent: false },
  { text: "break", accent: false },
  { text: "&", accent: true },
  { text: "Wellness", accent: true },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    // WCAG 2.2.2: no auto-advance while paused or when the user asked for less motion
    if (paused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, prefersReducedMotion]);

  useGsap(() => {
    const mm = gsap.matchMedia();

    /* ---- Entrance: headline words rise on a stagger, once, on load ---------
       Initial state is set here with gsap.set rather than in CSS. If this script
       never runs — JS error, old browser, blocked bundle — the words are simply
       already visible, instead of a page of permanent opacity: 0. Same principle
       everywhere below. */
    mm.add(MEDIA.motion, () => {
      gsap.set("[data-word]", { yPercent: 110, opacity: 0 });
      gsap.set("[data-hero-sub], [data-hero-cta]", { y: 24, opacity: 0 });

      const intro = gsap.timeline({ defaults: { ease: EASE } });
      intro
        .to("[data-word]", { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 })
        .to("[data-hero-sub]", { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
        .to("[data-hero-cta]", { y: 0, opacity: 1, duration: 0.7 }, "-=0.5");
    });

    /* ---- Desktop: pin, and pull the three layers apart on scroll -----------
       Backdrop moves least, product image moves more, foreground vignette and
       the copy move most. Different rates over the same scroll distance is what
       actually reads as depth — a single translated image reads as a slide. */
    mm.add(MEDIA.desktop, () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          /* The copy is fully out at ~50% of the travel. At +=90% the pin held
             for another ~800px of nothing but photograph, which reads as the
             page having stalled. */
          end: "+=45%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      tl.to("[data-layer='back']", { yPercent: 8, scale: 1.06, ease: "none" }, 0)
        .to("[data-layer='mid']", { yPercent: 18, scale: 1.12, ease: "none" }, 0)
        .to("[data-layer='fore']", { yPercent: 30, opacity: 1, ease: "none" }, 0)
        /* Copy leaves upward and fades. Deliberately no `z`: the perspective
           origin is the viewport centre, so translating left-half content
           forward also translates it left. z:220 walked the h1's left edge from
           31px to -111px over the pin — "Natural" lost its N and the Explore Catalogue
           button was sliced by the viewport edge. The three background layers
           already carry the depth. */
        .to("[data-hero-copy]", { yPercent: -34, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-indicators]", { opacity: 0, ease: "none" }, 0);
    });

    /* ---- Mobile: no pin ----------------------------------------------------
       A pinned full-height hero on a phone costs a scroll gesture before anything
       happens, and pin + scrub on a 1.6MB image is where the frame budget goes.
       Same parallax idea, a third of the travel, nothing pinned. */
    mm.add(MEDIA.mobile, () => {
      gsap.to("[data-layer='mid']", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
  }, root);

  return (
    <section
      ref={root}
      className="scene relative h-[600px] lg:h-[700px] xl:h-[820px] overflow-hidden bg-[hsl(162_45%_6%)]"
      aria-label="Hero slideshow showcasing natural beauty products"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Layer 1 — backdrop. Emerald depth behind the product, and a gold pool
          roughly under the bottle so the flagship reads as lit, not pasted. */}
      <div
        data-layer="back"
        aria-hidden="true"
        className="absolute -inset-[10%] will-change-transform"
        style={{
          background:
            "radial-gradient(60% 55% at 68% 55%, hsl(var(--gold) / 0.20), transparent 70%)," +
            "radial-gradient(80% 80% at 30% 20%, hsl(162 45% 18%), transparent 65%)," +
            "linear-gradient(160deg, hsl(162 45% 9%), hsl(162 40% 4%))",
        }}
      />

      {/* Layer 2 — the product photography */}
      <div data-layer="mid" className="absolute -inset-[6%] will-change-transform">
        {slides.map((slide, index) => (
          <div
            key={slide.alt}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
              /* The flagship is the LCP element, so it loads eagerly and decodes
                 synchronously; the rest stay lazy and cost nothing until the
                 carousel advances. No fetchPriority — React 18 does not map the
                 camelCase prop and warns on every render. */
              loading={slide.priority ? "eager" : "lazy"}
              decoding={slide.priority ? "sync" : "async"}
            />
            <div className={`absolute inset-0 ${slide.scrim}`} />
          </div>
        ))}
      </div>

      {/* Layer 3 — foreground vignette. Starts at partial opacity so it reads on
          load, and deepens as the scroll pulls it forward. */}
      <div
        data-layer="fore"
        aria-hidden="true"
        className="absolute -inset-[4%] opacity-60 pointer-events-none will-change-transform"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, transparent 45%, hsl(162 45% 4% / 0.75))",
        }}
      />

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center preserve-3d">
        <div data-hero-copy className="max-w-xl text-white will-change-transform">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.05] tracking-[-0.03em]">
            {HEADLINE.map((word, i) =>
              word.text === "break" ? (
                <br key="break" />
              ) : (
                // Each word gets a clipping wrapper so it rises out of nothing
                // rather than sliding over the words above it.
                <span key={word.text} className="inline-block overflow-hidden align-bottom pb-1">
                  {/* Gold, not text-primary. The deep green (162 45% 35%) measured
                      1.01–1.66 against these photographs — a straight WCAG fail
                      that predates this work. Gold is the flagship's own second
                      colour and clears 3:1 on every slide. */}
                  <span
                    data-word
                    className={`inline-block ${word.accent ? "text-gold" : "text-white"}`}
                  >
                    {word.text}
                    {i < HEADLINE.length - 1 && HEADLINE[i + 1].text !== "break" ? " " : ""}
                  </span>
                </span>
              ),
            )}
          </h1>

          <p
            data-hero-sub
            className="text-lg md:text-2xl text-white/95 mb-8 leading-relaxed max-w-md"
          >
            Explore sample oils, herbs and personal care products in this storefront concept.
          </p>

          <div data-hero-cta className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-float"
            >
              <Link to="/shop">Explore Catalogue</Link>
            </Button>
            {/* White text, not text-primary: the deep green sat around 2:1 on the
                darker slides. White on the scrimmed image clears comfortably. */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/80 bg-white/5 text-white backdrop-blur-sm hover:bg-white hover:text-foreground px-8 py-6 text-lg rounded-full"
            >
              <Link to="/learn-more">About This Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div
        data-hero-indicators
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
        role="group"
        aria-label="Slideshow navigation"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.alt}
            type="button"
            onClick={() => setCurrentSlide(index)}
            /* before:-inset-3 pads the 8px dot out to a 32px hit target (WCAG 2.5.8) */
            className={`relative h-2 rounded-full transition-all before:absolute before:-inset-3 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2"
            }`}
            aria-current={index === currentSlide}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
