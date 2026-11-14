import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Heart, Share2, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { MAX_CART_QUANTITY } from "@/lib/schemas";
import { useGsap } from "@/hooks/use-gsap";
import { gsap, EASE, MEDIA } from "@/lib/gsap";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, saved, toggleSaved } = useCart();
  const product = products.find((p) => p.id === id);
  const root = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [manualLink, setManualLink] = useState("");
  const isSaved = id ? saved.includes(id) : false;

  /* Same category first, then featured products from other categories to fill
     the row. The same-category filter alone returned a single card into a
     four-column grid — there are only two Oils products in the catalogue. */
  const related = product
    ? [
        ...products.filter((p) => p.category === product.category && p.id !== product.id),
        ...products.filter(
          (p) => p.featured && p.category !== product.category && p.id !== product.id,
        ),
      ].slice(0, 4)
    : [];

  /* The product photo drifts and scales against the scroll while the spec column
     stays put — the image behaves like an object sitting behind the page rather
     than a block glued to it. `id` in the deps so the trigger is rebuilt when
     the route changes between products without a remount. */
  useGsap(() => {
    // Hooks cannot live below the not-found return, so the guard goes here
    // instead: that branch renders none of these targets.
    if (!product) return;

    gsap.matchMedia().add(MEDIA.motion, () => {
      gsap.to("[data-detail-image]", {
        yPercent: -10,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-detail-frame]",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.set("[data-detail-info] > *", { opacity: 0, y: 28 });
      gsap.to("[data-detail-info] > *", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.06,
      });
    });
  }, root, [id]);

  if (!product) {
    return (
      // ref, so gsap.context() has a live scope instead of warning about a
      // detached node and targeting the document.
      <div ref={root} className="container mx-auto px-4 py-24 text-center">
        <h1 className="mb-4 text-3xl font-bold">Product Not Found</h1>
        <Button asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div ref={root} className="container mx-auto px-4 py-16 lg:py-24">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div
          data-detail-frame
          className="relative aspect-square overflow-hidden rounded-2xl bg-secondary shadow-lift"
        >
          <img
            data-detail-image
            src={product.image}
            alt={product.illustrativeImage ? "" : product.name}
            /* 130% tall, offset -15%, so the photo sits centred in the frame and
               the -10% drift still leaves 2% of cover at both extremes. Sized
               against the tween below — change one and re-check the other. */
            className="absolute -top-[15%] left-0 h-[130%] w-full object-cover will-change-transform"
          />
          {product.discount && (
            <Badge className="absolute right-4 top-4 bg-badge text-badge-foreground">
              {product.discount}% OFF
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div data-detail-info>
          <p className="mb-2 text-sm text-muted-foreground">{product.category}</p>
          <h1 className="mb-4 text-4xl font-bold tracking-[-0.02em] lg:text-5xl">
            {product.name}
          </h1>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-success">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* `inStock` was already in the catalogue and shown nowhere. */}
          <p className="mb-6 flex items-center gap-2 text-sm font-medium">
            {product.inStock ? (
              <>
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                In stock
              </>
            ) : (
              <span className="text-muted-foreground">Out of stock</span>
            )}
          </p>

          <p className="mb-4 max-w-prose text-muted-foreground">{product.description}</p>
          {product.illustrativeImage && <p className="mb-4 text-sm text-muted-foreground">Illustrative category image.</p>}

          {/* Quantity, then the actions. The PDP could only ever add one at a
              time while the product card had a stepper. */}
          <div className="mb-4 flex items-center gap-4">
            <span id="qty-label" className="text-sm font-medium">
              Quantity
            </span>
            <div className="flex items-center rounded-lg border" role="group" aria-labelledby="qty-label">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="w-12 text-center font-medium" aria-live="polite">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => setQuantity((q) => Math.min(q + 1, MAX_CART_QUANTITY))}
                disabled={quantity >= MAX_CART_QUANTITY}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* size="icon" h-11 w-11 on the two secondary actions, not size="lg".
              size="lg" carries px-8, which made each icon-only button 82px wide;
              the row's min-content came to 366px inside a 343px grid track, and
              a grid item's default min-width:auto refuses to shrink — that was
              the whole 375px horizontal page scroll, and it sliced Add to Cart. */}
          <div className="mb-8 flex flex-wrap gap-2">
            <Button
              size="lg"
              onClick={() => addToCart(product, quantity)}
              disabled={!product.inStock}
              className="flex-1 bg-success hover:bg-success/90"
            >
              <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
              Add to Cart
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11 shrink-0"
              onClick={() => toggleSaved(product.id)}
              aria-pressed={isSaved}
              aria-label={`${isSaved ? "Remove" : "Save"} ${product.name}`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} aria-hidden="true" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11 shrink-0"
              onClick={async () => {
                const url = new URL(window.location.pathname, window.location.origin);
                url.hash = `/product/${product.id}`;
                setManualLink("");
                if (navigator.share) {
                  try {
                    await navigator.share({ title: product.name, url: url.href });
                    return;
                  } catch (error) {
                    if (error instanceof DOMException && error.name === "AbortError") return;
                  }
                }
                try {
                  await navigator.clipboard.writeText(url.href);
                  toast.success("Product link copied.");
                } catch {
                  setManualLink(url.href);
                }
              }}
              aria-label={`Share ${product.name}`}
            >
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {manualLink && (
            <div className="mb-6 rounded-lg border p-4">
              <p role="status" className="mb-2 text-sm">Automatic sharing is unavailable. Copy this link manually.</p>
              <label className="text-sm font-medium" htmlFor="product-share-link">Product link</label>
              <input id="product-share-link" className="mt-2 w-full rounded border bg-background p-2" readOnly value={manualLink} onFocus={event => event.currentTarget.select()} />
            </div>
          )}
          <p className="border-t pt-4 text-sm text-muted-foreground">Sample listing · Prices and availability are for demonstration.</p>
        </div>
      </div>

      {/* Related Products. <ProductCard>, not a third bespoke card treatment —
          this page had its own reduced version with no rating, no badge and no
          add-to-cart. */}
      {related.length > 0 && (
        <section className="mt-20" aria-label="Related products">
          <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em]">You May Also Like</h2>
          <div className="scene grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
