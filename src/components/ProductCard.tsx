import { useState, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { MAX_CART_QUANTITY } from "@/lib/schemas";
import { useGsap } from "@/hooks/use-gsap";
import { gsap } from "@/lib/gsap";

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const scene = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  /* ---- Pointer-tracked 3D tilt -------------------------------------------
     Gated on `(hover: hover) and (pointer: fine)`: on a touchscreen there is no
     pointer to track, and touch devices keep the plain shadow-lift hover. */
  useGsap(() => {
    const el = scene.current;
    if (!el) return;

    const canTilt = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!canTilt) return;

    const card = el.querySelector<HTMLElement>("[data-tilt]");
    const sheen = el.querySelector<HTMLElement>("[data-sheen]");
    if (!card || !sheen) return;

    // quickTo reuses one tween per property instead of allocating a new tween on
    // every mousemove — the difference between smooth and a GC sawtooth.
    const rotX = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
    const rotY = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
    const sheenX = gsap.quickTo(sheen, "xPercent", { duration: 0.6, ease: "power3" });
    const sheenY = gsap.quickTo(sheen, "yPercent", { duration: 0.6, ease: "power3" });

    const MAX_TILT = 7; // degrees — past ~10 it stops reading as depth and starts reading as a gimmick

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotY(px * MAX_TILT * 2);
      rotX(-py * MAX_TILT * 2);
      sheenX(px * 60);
      sheenY(py * 60);
    };

    const onEnter = () => {
      gsap.to(card, { z: 40, duration: 0.5, ease: "power3.out" });
      gsap.to(sheen, { opacity: 1, duration: 0.4, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, z: 0, duration: 0.7, ease: "power3.out" });
      gsap.to(sheen, { opacity: 0, duration: 0.4, ease: "power2.out" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    // Returned to gsap.context, so it runs on revert alongside the tweens.
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, scene);

  return (
    <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
      <div ref={scene} data-product-card className="scene-near">
      <Card
        data-tilt
        onContextMenu={(event) => {
          event.preventDefault();
          setQuickViewOpen(true);
        }}
        className="group relative preserve-3d shadow-rest hover:shadow-float transition-shadow duration-500 overflow-hidden focus-within:ring-2 focus-within:ring-primary"
      >
        <div>
        <Link
          to={`/product/${product.id}`}
          aria-label={`View details for ${product.name}`}
        >
          <div className="relative aspect-square overflow-hidden bg-secondary">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-secondary animate-pulse" />
            )}
            <img
              src={product.image}
              alt={product.illustrativeImage ? "" : product.name}
              className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              /* onError too, or a 404 leaves an invisible img over a skeleton
                 pulsing forever — and suppresses the alt-text fallback. */
              onError={() => setImageLoaded(true)}
            />
            {/* Specular sheen — a soft highlight that tracks the pointer across
                the product photo, the way light moves over a glossy surface.
                Scoped to the image, not the whole card: washing 28% white across
                the footer would knock down the Add-to-Cart button's contrast.
                Decorative, so it is hidden from assistive tech and never
                intercepts a click. */}
            <div
              data-sheen
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1/4 opacity-0 will-change-transform"
              style={{
                background:
                  "radial-gradient(closest-side, hsl(0 0% 100% / 0.30), hsl(var(--gold) / 0.12) 45%, transparent 70%)",
              }}
            />
            {product.discount && (
              <Badge 
                className="absolute top-2 right-2 bg-badge text-badge-foreground"
                aria-label={`${product.discount}% discount`}
              >
                {product.discount}% OFF
              </Badge>
            )}
            {product.illustrativeImage && <span className="absolute bottom-1 left-1 rounded bg-background px-1.5 py-1 text-[10px] leading-tight text-foreground">Category image</span>}
          </div>
        </Link>

        <CardContent className="p-2.5 sm:p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <Link 
            to={`/product/${product.id}`} 
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="text-lg font-bold text-success">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </CardContent>
        </div>

        <CardFooter className="flex-col gap-2 p-2.5 pt-0 sm:p-4 sm:pt-0">
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full px-2"
              aria-label={`Quick View: ${product.name}`}
            >
              Quick View
            </Button>
          </DialogTrigger>
          {!showQuantitySelector ? (
            <Button
              onClick={() => setShowQuantitySelector(true)}
              disabled={!product.inStock}
              className="w-full bg-success hover:bg-success/90"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="hidden h-4 w-4 sm:block" aria-hidden="true" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          ) : (
            <div className="grid w-full gap-2" role="group" aria-label="Quantity selector">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => setSelectedQuantity(q => q - 1)}
                  aria-label="Decrease quantity"
                  disabled={selectedQuantity <= 1}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span 
                  className="min-w-0 flex-1 px-1 text-center font-medium"
                  aria-label={`Quantity: ${selectedQuantity}`}
                  aria-live="polite"
                >
                  {selectedQuantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => setSelectedQuantity(q => q + 1)}
                  aria-label="Increase quantity"
                  disabled={selectedQuantity >= MAX_CART_QUANTITY}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <Button
                onClick={() => { addToCart(product, selectedQuantity); setShowQuantitySelector(false); setSelectedQuantity(1); }}
                className="w-full bg-success hover:bg-success/90"
                aria-label={`Add ${selectedQuantity} ${selectedQuantity === 1 ? 'item' : 'items'} to cart`}
              >
                Add
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      </div>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-lg motion-reduce:animate-none">
        <DialogHeader className="pr-7 text-left">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.category}</DialogDescription>
        </DialogHeader>
        <figure>
          <img
            src={product.image}
            alt={product.illustrativeImage ? "" : product.name}
            className="h-[min(36dvh,18rem)] w-full rounded-md bg-secondary object-contain"
          />
          {product.illustrativeImage && (
            <figcaption className="mt-1 text-xs text-muted-foreground">Category image</figcaption>
          )}
        </figure>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <div className="flex flex-wrap items-center gap-x-2">
          <span className="text-lg font-bold text-success">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            disabled={!product.inStock}
            className="h-11 bg-success hover:bg-success/90"
            onClick={() => {
              addToCart(product, 1);
              setQuickViewOpen(false);
            }}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button asChild variant="outline" className="h-11">
            <Link to={`/product/${product.id}`} onClick={() => setQuickViewOpen(false)}>
              View Details
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
