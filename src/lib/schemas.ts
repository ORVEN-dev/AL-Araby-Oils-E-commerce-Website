import { z } from "zod";

export const MAX_CART_QUANTITY = 99;

/**
 * A cart entry is a product id and a quantity. Nothing else.
 *
 * DESIGN RULE — the cart on the wire carries ids + quantities only, never price.
 * Every price the UI shows is looked up from the catalogue by `id` at hydration
 * time, so a tampered `cart` key in localStorage cannot move `cartTotal`. If an
 * order endpoint is ever added it must do the same: re-read each price from the
 * server's own catalogue. Accepting a client-sent price, line total, or order
 * total lets the customer set their own prices.
 *
 * zod strips unknown keys by default, so carts written by an older build (full
 * product objects) still hydrate — the extra fields are simply discarded.
 */
const cartItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export const storedCartSchema = z.array(cartItemSchema);
