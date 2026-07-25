import { Link } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/shop", label: "All Products" },
  { to: "/shop?category=Herbs", label: "Herbs" },
  { to: "/shop?category=Oils", label: "Oils" },
  { to: "/shop?category=Skin Care", label: "Skin Care" },
  { to: "/shop?category=Hair Care", label: "Hair Care" },
  { to: "/shop?category=Supplements", label: "Supplements" },
  { to: "/blog", label: "Blog" },
];

const linkClass =
  "text-sm font-medium hover:text-primary transition-colors rounded px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const SearchField = ({ id }: { id: string }) => (
  <>
    <label htmlFor={id} className="sr-only">
      Search for products
    </label>
    <Search
      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      aria-hidden="true"
    />
    <Input
      id={id}
      type="search"
      placeholder="Search for herbs, oils, beauty products..."
      className="pl-10 bg-secondary"
    />
  </>
);

const Navbar = () => {
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Skip to main content. A button, not an anchor: under HashRouter an
          href="#main-content" would be read as a route and land on NotFound. */}
      <button
        type="button"
        onClick={() => document.getElementById("main-content")?.focus()}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </button>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2 md:gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-primary whitespace-nowrap rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Alaraby Oils - Go to homepage"
          >
            Alaraby Oils
          </Link>

          {/* Search Bar — hidden on mobile, lives in the drawer instead */}
          <div className="hidden md:block flex-1 max-w-xl relative">
            <SearchField id="search-input" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="icon" aria-label="Go to login page">
                <User className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-badge text-badge-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 mt-4" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={label} to={to} className={`${linkClass} py-1`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation. `invisible` when closed so the links leave the tab
            order — max-h-0 + opacity-0 alone keep them focusable. */}
        <nav
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[32rem] opacity-100 mt-4" : "max-h-0 opacity-0 invisible"
          }`}
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-2 pb-4">
            <div className="relative mb-2">
              <SearchField id="mobile-search-input" />
            </div>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className={`${linkClass} py-2`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
