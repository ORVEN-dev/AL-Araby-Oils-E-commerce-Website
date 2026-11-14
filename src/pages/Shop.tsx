import { useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useGsap } from "@/hooks/use-gsap";
import { gsap, ScrollTrigger, EASE, MEDIA } from "@/lib/gsap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Herbs",
  "Oils",
  "Skin Care",
  "Hair Care",
  "Aromatherapy",
  "Supplements",
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const query = (searchParams.get("q") ?? "").trim();
  const discounted = searchParams.get("offers") === "1";
  const sortBy = searchParams.get("sort") ?? "featured";

  // Resolve the raw query string to a canonical label so `?category=oils` and
  // `?category=Oils` are the same store, and the heading reads properly either way.
  const selectedCategory = useMemo(
    () =>
      categoryParam
        ? categories.find((c) => c.toLowerCase() === categoryParam.toLowerCase()) ?? categoryParam
        : null,
    [categoryParam],
  );

  // Derived, not state: a useEffect here painted all 12 products for one frame
  // before flashing down to the filtered set.
  const filteredProducts = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = products.filter((product) => {
      const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return (!categoryParam || product.category.toLowerCase() === categoryParam.toLowerCase())
        && (!discounted || (product.discount ?? 0) > 0)
        && terms.every(term => text.includes(term));
    });

    // Array.sort is stable, so each of these keeps catalogue order within ties.
    if (sortBy === "price") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "discount") {
      // Sorts, does not filter — this control is labelled "Sort by".
      return list.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    }
    return list.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  }, [categoryParam, discounted, query, sortBy]);

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const root = useRef<HTMLDivElement>(null);

  /* Grid entrance. ScrollTrigger.batch groups everything that crosses the line
     within one frame into a single staggered tween, so a four-across row arrives
     as a row rather than as four unrelated fades.
     Re-runs on filter change — the deps below tear the old triggers down first. */
  useGsap(() => {
    gsap.matchMedia().add(MEDIA.motion, () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-product-card]");
      if (!cards.length) return;

      // Initial state in JS, never in CSS: if this never runs, the grid is just
      // a normal visible grid rather than a page of invisible cards.
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
            stagger: 0.08, // 4 across = 240ms of stagger, under the 500ms ceiling
            overwrite: true,
          }),
      });
    });
  }, root, [filteredProducts]);

  return (
    <div ref={root}>
      {/* Header band. Same dark emerald surface as the category band on Home —
          this is the page that actually sells, and it was reading as a cheaper
          site than the homepage: py-8, a plain text-3xl h1, no brand colour
          anywhere. Title, count and both filter controls sit on the dark. */}
      <section className="bg-[hsl(162_45%_7%)] py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-white lg:text-4xl">
            {discounted ? "Demo Offers" : selectedCategory ?? "All Products"}
          </h1>
          <p className="mt-2 max-w-prose text-white/70">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}{query ? ` for “${query}”` : " in the sample catalogue"}
          </p>
          {(query || discounted || categoryParam) && <Button variant="secondary" className="mt-4" onClick={() => setSearchParams({})}>Clear filters</Button>}

          <div className="mt-6 flex flex-col gap-3 lg:mt-8 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat || (!selectedCategory && cat === "All");
                return (
                  <Button
                    key={cat}
                    variant="outline"
                    aria-pressed={isActive}
                    onClick={() => updateFilter("category", cat === "All" ? null : cat)}
                    className={
                      isActive
                        ? "border-white bg-white text-foreground hover:bg-white/90"
                        : "border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-foreground"
                    }
                  >
                    {cat}
                  </Button>
                );
              })}
            </div>

            <Select value={["discount", "price"].includes(sortBy) ? sortBy : "featured"} onValueChange={value => updateFilter("sort", value === "featured" ? null : value)}>
              <SelectTrigger
                className="w-full border-white/40 bg-white/10 text-white backdrop-blur-sm lg:w-[200px]"
                aria-label="Sort products by"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="discount">Biggest Discount</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 lg:py-16">
        {/* grid-cols-2 at 375, not grid-cols-1: one card per screen made the
            document 8400px of scrolling to see twelve products.
            `scene` gives the cards a shared vanishing point, so the rotateX
            entrance and the hover tilt read as one space rather than as each
            card having its own private camera. */}
        <div className="scene grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No products match these filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
