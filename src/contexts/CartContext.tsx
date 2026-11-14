import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "@/types/product";
import { products } from "@/data/products";
import { MAX_CART_QUANTITY, storedCartSchema } from "@/lib/schemas";
import { toast } from "sonner";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  saved: string[];
  toggleSaved: (productId: string) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "orven:al-araby-oils:cart:v1";
const SAVED_KEY = "orven:al-araby-oils:saved:v1";

/**
 * Hydrate the cart from localStorage.
 *
 * This runs inside the state initialiser of the provider that wraps the whole
 * tree, so anything thrown here unmounts the app to a blank page with no way
 * back. `mohammed-004del.github.io` is one origin shared by every repo the owner
 * publishes, so an unrelated project writing a `cart` key lands here too — the
 * stored value is untrusted input and is treated as such.
 *
 * Prices are never read from storage; each entry is resolved against the
 * catalogue by id (see the DESIGN RULE in @/lib/schemas). Ids that no longer
 * exist are dropped rather than rendered as holes.
 */
const loadCart = (allowLegacy = true): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? (allowLegacy ? localStorage.getItem("cart") : null);
    if (!raw) return [];

    const parsed = storedCartSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];

    const quantities = new Map<string, number>();
    for (const { id, quantity } of parsed.data) {
      quantities.set(id, Math.min((quantities.get(id) ?? 0) + quantity, MAX_CART_QUANTITY));
    }
    return [...quantities].flatMap(([id, quantity]) => {
      const product = products.find((p) => p.id === id);
      return product?.inStock ? [{ ...product, quantity }] : [];
    });
  } catch {
    // Invalid JSON, or storage blocked (private mode / disabled cookies).
    return [];
  }
};

const clampQuantity = (quantity: number) =>
  Math.min(Math.max(Math.round(quantity), 1), MAX_CART_QUANTITY);

function loadSaved(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return Array.isArray(stored) ? products.filter(product => stored.includes(product.id)).map(product => product.id) : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [saved, setSaved] = useState(loadSaved);

  useEffect(() => {
    try {
      // Persist ids + quantities only — see the DESIGN RULE in @/lib/schemas.
      const stored = cart.map(({ id, quantity }) => ({ id, quantity }));
      const next = JSON.stringify(stored);
      if (localStorage.getItem(STORAGE_KEY) !== next) localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage full or blocked. The in-memory cart still works; losing
      // persistence is not worth taking the page down for.
    }
  }, [cart]);

  useEffect(() => {
    try {
      const next = JSON.stringify(saved);
      if (localStorage.getItem(SAVED_KEY) !== next) localStorage.setItem(SAVED_KEY, next);
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
  }, [saved]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return;
      if (event.key === STORAGE_KEY || event.key === null) setCart(loadCart(false));
      if (event.key === SAVED_KEY || event.key === null) setSaved(loadSaved());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product.inStock) return;
    /* The quantity that is *stored* is derived inside the updater, from
       `prevCart`. The previous version computed it from the render closure's
       `cart` and then wrote it through setCart(prev => …) — two sources of
       truth, correct only while every add lands in its own committed render and
       wrong the moment anything batches or defers them (two clicks in a frame,
       startTransition).

       The updater stays pure: React may invoke it late, or twice under
       StrictMode, so nothing outside reads a value written from inside it. */
    setCart((prevCart) =>
      prevCart.some((item) => item.id === product.id)
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
              : item,
          )
        : [...prevCart, { ...product, quantity: clampQuantity(quantity) }],
    );

    // Display only, from this render's snapshot. Deliberately not read back out
    // of the updater — see above. Worst case under rapid double-add the toast
    // announces one step behind; the cart itself is always right.
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      toast.success(`Updated to ${clampQuantity(existing.quantity + quantity)} items in cart`);
    } else {
      const added = clampQuantity(quantity);
      toast.success(`${added} item${added > 1 ? "s" : ""} added to cart`);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
      ),
    );
  };

  const toggleSaved = (productId: string) => {
    setSaved(items => items.includes(productId) ? items.filter(id => id !== productId) : [...items, productId]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, saved, toggleSaved, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
