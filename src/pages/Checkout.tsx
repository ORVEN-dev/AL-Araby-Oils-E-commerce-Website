import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export default function Checkout() {
  const { cart, cartTotal } = useCart();
  const [reviewed, setReviewed] = useState(false);
  if (!cart.length) {
    return <section className="container mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Your demo cart is empty</h1>
      <p className="my-4 text-muted-foreground">Add a product to try the checkout preview.</p>
      <Button asChild><Link to="/shop">Browse Products</Link></Button>
    </section>;
  }
  return (
    <section className="container mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">Storefront concept</p>
      <h1 className="mt-2 text-4xl font-bold">Demo Checkout</h1>
      <p className="mb-8 mt-3 text-muted-foreground">Preview an order summary using sample prices. This demo creates no order, collects no personal details, and takes no payment.</p>
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border bg-card p-5 sm:p-7">
          <h2 className="mb-4 text-xl font-semibold">Items in your demo cart</h2>
          <ul className="divide-y">
            {cart.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3">
              <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.quantity} × ${item.price.toFixed(2)}</p></div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>)}
          </ul>
        </div>
        <form className="rounded-xl border bg-card p-5 sm:p-7" onSubmit={(e) => { e.preventDefault(); setReviewed(true); }}>
          <h2 className="text-xl font-semibold">Review the preview</h2>
          <p className="my-4">Demo subtotal <strong className="ml-2">${cartTotal.toFixed(2)}</strong></p>
          <p className="mb-5 text-sm text-muted-foreground">Shipping and payment are outside this demo.</p>
          <label className="mb-5 flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-1 size-4 accent-primary" onChange={() => setReviewed(false)} /> I understand this is a demo.</label>
          <Button type="submit" className="w-full">Preview Order Summary</Button>
          <div role="status" className="mt-3 text-sm">{reviewed && "Preview complete. No order was placed or payment taken. Your cart is still available."}</div>
          <Button asChild variant="outline" className="mt-3 w-full"><Link to="/cart">Back to Cart</Link></Button>
        </form>
      </div>
    </section>
  );
}
