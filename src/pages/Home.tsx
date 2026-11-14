import { useRef } from "react";
import { Link } from "react-router-dom";
import { Leaf, Droplet, Heart, ShieldCheck } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products, categories } from "@/data/products";
import { useGsap } from "@/hooks/use-gsap";
import { gsap, ScrollTrigger, EASE, MEDIA } from "@/lib/gsap";
import herbsImg from "@/assets/hero-herbs.jpg";
import oilsImg from "@/assets/hero-oils-1.jpg";
import beautyImg from "@/assets/hero-beauty.jpg";
import supplementsImg from "@/assets/hero-supplements.jpg";

const CATALOGUE_FEATURES = [
  {
    icon: Leaf,
    title: "Find products by category",
    body: "Browse the sample collections by product type, from dried botanicals to personal care.",
    image: herbsImg,
    alt: "Dried herbs and botanicals laid out on a work surface",
  },
  {
    icon: Droplet,
    title: "Compare sample prices",
    body: "Each listing presents a sample price and shows the price difference when a demo discount applies.",
    image: oilsImg,
    alt: "Essential oil being decanted into a small amber bottle",
  },
  {
    icon: Heart,
    title: "Save products for later",
    body: "Keep a shortlist in your browser while you explore the collection.",
    image: beautyImg,
    alt: "Organic beauty and wellness products arranged together",
  },
  {
    icon: ShieldCheck,
    title: "Review a demo cart",
    body: "Change quantities and see a sample summary before previewing checkout.",
    image: supplementsImg,
    alt: "Supplement bottles on a shelf in natural light",
  },
];

const topDiscount = Math.max(0, ...products.map(product => product.discount ?? 0));

const Home = () => {
  const featuredProducts = products.filter((p) => p.featured);
  const root = useRef<HTMLDivElement>(null);

  useGsap(() => {
    const mm = gsap.matchMedia();

    /* Every initial state below is set with gsap.set inside a motion branch, never
       in CSS. With reduced motion — or if this file never runs at all — the page
       is a normal, fully visible page rather than a stack of invisible sections. */

    /* ---- 1. Promo: the numeral and the copy move against each other ---------
       Not a fade-rise. The 50% figure drifts up and grows while the copy comes in
       from the side, so the two halves of the panel separate in depth as it
       crosses the viewport. */
    mm.add(MEDIA.motion, () => {
      gsap.set("[data-promo-copy]", { opacity: 0, x: -40 });
      gsap.to("[data-promo-copy]", {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: { trigger: "[data-promo]", start: "top 78%", once: true },
      });

      gsap.to("[data-promo-figure]", {
        yPercent: -22,
        scale: 1.18,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-promo]",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    /* ---- 2. Featured grid: batched stagger ---------------------------------
       Same treatment as the Shop grid on purpose — a row of product cards is a
       list, and list rhythm is the one place a uniform stagger is the right
       answer. batch() groups whatever crosses the line in the same frame, so a
       four-across row arrives as a row. */
    mm.add(MEDIA.motion, () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-deals] [data-product-card]");
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 48, rotateX: -8 });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.7,
              ease: EASE,
              stagger: 0.08,
              overwrite: true,
            }),
        });
      }
    });

    /* ---- 3. Categories: horizontal band ------------------------------------
       Pin the section and translate the track sideways as the page scrolls down.
       Desktop only: on a phone the native overflow scroller below is better than
       stealing four viewport-heights of vertical scroll.

       The scroller is overflow-x-auto in the markup and only switched to hidden
       *here*, from JS. If this never runs, the band stays a normal swipeable
       scroller instead of a container with two panels clipped out of reach. */
    mm.add(MEDIA.desktop, () => {
      const panel = root.current?.querySelector<HTMLElement>("[data-cat-panel]");
      const scroller = root.current?.querySelector<HTMLElement>("[data-cat-scroller]");
      const track = root.current?.querySelector<HTMLElement>("[data-cat-track]");
      if (!panel || !scroller || !track) return;

      gsap.set(scroller, { overflow: "hidden" });

      // Recomputed on every refresh (resize, font load) via invalidateOnRefresh,
      // so the band always stops exactly at the last panel's right edge.
      const distance = () => Math.max(0, track.scrollWidth - scroller.clientWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none", // required: anything else desyncs scroll from position
        scrollTrigger: {
          trigger: panel,
          pin: panel,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });

    /* ---- 4. Why our oils: copy holds, imagery advances ---------------------
       The copy column is pinned with CSS `position: sticky` rather than with a
       ScrollTrigger pin — it is one line of CSS, it cannot leak a trigger, and it
       survives JS failing entirely. ScrollTrigger's only job here is dimming the
       steps that are not current, which is decoration on top of a page that
       already reads correctly without it. */
    mm.add(MEDIA.desktop, () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-why-step]");
      const panels = gsap.utils.toArray<HTMLElement>("[data-why-panel]");
      if (steps.length !== panels.length) return;

      /* 0.6, not 0.35. At 0.35 the muted body copy measured 1.53:1 against the
         cream page — three of the four value propositions were unreadable for
         most of the scroll. 0.6 is ~2.6:1: still unmistakably the secondary
         state, still legible. */
      const DIM = 0.6;
      gsap.set(steps.slice(1), { opacity: DIM });

      const setActive = (index: number) =>
        steps.forEach((step, i) =>
          gsap.to(step, { opacity: i === index ? 1 : DIM, duration: 0.4, ease: EASE }),
        );

      panels.forEach((panelEl, i) => {
        ScrollTrigger.create({
          trigger: panelEl,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });

        // Each image drifts inside its own frame — the media column reads as
        // moving past a window rather than sliding as one block.
        gsap.to(panelEl.querySelector("img"), {
          yPercent: -10,
          ease: "none",
          scrollTrigger: { trigger: panelEl, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    });
  }, root);

  return (
    <div ref={root} className="min-h-screen">
      <Hero />

      {/* ---- Promo ----
          py-12/16, not py-16/24: the section was 476px tall to hold a 284px card,
          and the leftover was flat cream with nothing in it. */}
      <section data-promo className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* bg-card + shadow-lift, not bg-secondary/60: cream-on-cream was half a
              shade apart, so the card read as a floating rectangle rather than a
              surface sitting above the page. */}
          <div data-promo-copy className="rounded-2xl bg-card p-8 shadow-lift lg:p-10">
            <Badge className="mb-4 bg-badge text-badge-foreground">Sample pricing</Badge>
            <h2 className="mb-3 text-4xl font-bold tracking-[-0.02em]">
              Up to <span className="text-primary">{topDiscount}% off</span>
            </h2>
            <p className="mb-6 max-w-prose text-muted-foreground">
              See the difference between sample prices and compare products in the demo catalogue.
            </p>
            {/* Default (primary emerald). It was a crimson fill, which put a third
                hue on the fold directly under an emerald-and-gold hero. */}
            <Button asChild>
              <Link to="/shop?offers=1">Browse Demo Offers</Link>
            </Button>
          </div>

          {/* Decorative: the discount is stated in the heading beside it, so this
              is a graphic, not information a screen reader needs to repeat. */}
          <div className="text-center" aria-hidden="true">
            <div
              data-promo-figure
              /* inline-block, not block: as a block this div fills the grid
                 column (343px at 375vw), so scale(1.18) grew the *box* to 405px
                 and pushed the page into horizontal scroll. Hugging the glyphs
                 means the scale only grows the numeral, which fits. */
              className="inline-block text-[7rem] font-bold leading-none text-primary/20 will-change-transform lg:text-[10rem]"
            >
              {topDiscount}%
            </div>
            <p className="text-xl font-semibold text-muted-foreground">Largest sample discount</p>
          </div>
        </div>
      </section>

      {/* ---- Best Deals ---- */}
      <section data-deals className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="mb-2">
            Catalogue highlights
          </Badge>
          <h2 className="mb-2 text-3xl font-bold tracking-[-0.02em] lg:text-4xl">
            Featured Products
          </h2>
          <p className="text-muted-foreground">
            Explore examples from the oils, aromatherapy and personal care collections.
          </p>
        </div>

        <div className="scene mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/shop?offers=1">View All Demo Offers</Link>
          </Button>
        </div>
      </section>

      {/* ---- Categories: horizontal band ---- */}
      <section
        data-cat-panel
        className="overflow-hidden bg-[hsl(162_45%_7%)] py-16 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0"
        aria-label="Shop by category"
      >
        <div className="container mx-auto mb-10 px-4">
          <h2 className="mb-2 text-3xl font-bold tracking-[-0.02em] text-white lg:text-4xl">
            Shop By Category
          </h2>
          <p className="max-w-prose text-white/70">
            Four ranges, each sourced and finished differently. Scroll through them.
          </p>
        </div>

        {/* overflow-x-auto here, switched to hidden from JS only when the pinned
            band actually takes over. Native swipe on touch, keyboard-scrollable,
            and never a dead end if the script fails. */}
        {/* The band bleeds to x=0 while every other section respects the container
            gutter, so the first and last cards were sliced by a hard edge. The
            mask fades the cut instead of hiding it. */}
        <div
          data-cat-scroller
          className="overflow-x-auto pb-4 lg:pb-0"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
          }}
        >
          <div data-cat-track className="flex w-max gap-6 px-4 will-change-transform lg:px-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
            {/* Guarantees trailing space is inside scrollWidth — flex containers
                drop trailing padding in some engines, which would cut the last
                panel's right edge off at the end of the band. */}
            <div className="w-4 shrink-0 lg:w-8" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ---- Why our oils ---- */}
      <section className="container mx-auto px-4 py-16 lg:py-24" aria-label="Explore the storefront">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:h-fit lg:py-16">
            <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] lg:text-4xl">
              Explore the storefront
            </h2>
            <p className="mb-10 max-w-prose text-muted-foreground">
              Try the main steps of the shopping experience with a sample catalogue.
            </p>

            <ol className="space-y-10 lg:space-y-7">
              {CATALOGUE_FEATURES.map(({ icon: Icon, title, body, image, alt }) => (
                <li key={title} data-why-step>
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="mb-1 font-semibold">{title}</h3>
                      <p className="max-w-prose text-sm text-muted-foreground">{body}</p>
                    </div>
                  </div>

                  {/* Below lg there is no sticky column and no second grid track,
                      so the media column below would stack into four consecutive
                      full-bleed photographs after all four promises — the pairing
                      is lost. Each promise carries its own image instead. */}
                  <div className="mt-5 aspect-[4/3] overflow-hidden rounded-2xl shadow-lift lg:hidden">
                    <img
                      src={image}
                      alt={alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="hidden space-y-6 lg:block">
            {CATALOGUE_FEATURES.map(({ image, alt, title }) => (
              <div
                key={title}
                data-why-panel
                className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lift lg:aspect-[4/5]"
              >
                <img
                  src={image}
                  alt={alt}
                  loading="lazy"
                  /* Scaled past the frame so the parallax drift has somewhere to
                     travel without exposing an edge. */
                  className="absolute inset-0 h-[120%] w-full object-cover will-change-transform"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
