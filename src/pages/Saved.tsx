import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";

export default function Saved() {
  const { saved } = useCart();
  const items = products.filter(product => saved.includes(product.id));
  return <section className="container mx-auto px-4 py-12">
    <h1 className="text-4xl font-bold">Saved Products</h1>
    <p className="mb-7 mt-3 text-muted-foreground">Your picks are saved in this browser.</p>
    {items.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(product => <ProductCard product={product} key={product.id} />)}
    </div> : <p>No saved products. <Link className="text-primary underline" to="/shop">Browse Products</Link></p>}
  </section>;
}
