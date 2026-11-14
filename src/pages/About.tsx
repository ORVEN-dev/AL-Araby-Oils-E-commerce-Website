import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section className="container mx-auto max-w-4xl px-4 py-14">
      <p className="text-sm font-semibold text-primary">An independent ORVEN project</p>
      <h1 className="mt-3 text-4xl font-bold">About This Demo</h1>
      <p className="mt-4 max-w-prose text-muted-foreground">AL-Araby Oils explores how an online shop for oils, herbs and personal care can organize a catalogue and guide people from discovery to a cart preview.</p>
      <div className="my-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border bg-card p-6"><h2 className="text-xl font-semibold">Sample catalogue</h2><p className="mt-2 text-muted-foreground">Products, prices, stock and discounts are examples. Images may illustrate product categories. There is no real ordering, shipping, payment or customer account.</p></article>
        <article className="rounded-xl border bg-card p-6"><h2 className="text-xl font-semibold">What stays in your browser</h2><p className="mt-2 text-muted-foreground">The cart and saved product IDs are stored locally. Checkout collects no personal data. Product sharing uses your device’s share or copy controls. GitHub Pages serves the site.</p></article>
      </div>
      <Button asChild><Link to="/shop">Explore the Catalogue</Link></Button>
    </section>
  );
}
