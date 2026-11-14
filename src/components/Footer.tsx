import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-[hsl(162_45%_7%)] text-white">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-xl font-bold">Alaraby Oils</Link>
          <p className="mt-2 text-sm text-white/80">An independent ORVEN storefront concept.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 text-sm">
          <Link className="py-3 hover:underline" to="/shop">Shop Demo</Link>
          <Link className="py-3 hover:underline" to="/faq">FAQ</Link>
          <Link className="py-3 hover:underline" to="/about">About This Demo</Link>
        </nav>
      </div>
    </footer>
  );
}
