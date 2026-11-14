import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return <section className="container mx-auto max-w-3xl px-4 py-16">
    <h1 className="text-4xl font-bold">Demo Help</h1>
    <p className="mb-7 mt-4 text-muted-foreground">See how the catalogue, cart and checkout preview work. The storefront provides sample interactions and does not accept messages.</p>
    <Button asChild><Link to="/faq">Read the Demo FAQ</Link></Button>
  </section>;
}
