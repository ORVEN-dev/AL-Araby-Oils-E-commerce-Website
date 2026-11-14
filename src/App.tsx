import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HashRouter, Navigate, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const Saved = lazy(() => import("./pages/Saved"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component — matches the pre-mount spinner in index.html
const PageLoader = () => (
  <div
    className="flex items-center justify-center min-h-[400px]"
    role="status"
    aria-live="polite"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary" aria-hidden="true" />
    <span className="sr-only">Loading...</span>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <CartProvider>
      {/* sonner only. The shadcn/Radix <Toaster> was removed: nothing calls
          useToast(), so it mounted an always-empty fixed-position <ol> on every
          page. Two toast systems shipped, one used. */}
      <Sonner />
      {/* HashRouter, no basename: GitHub Pages has no server-side rewrite, and the
          hash path is independent of the repo subpath. See CLAUDE.md. */}
      <HashRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <p className="bg-secondary px-4 py-2 text-center text-sm font-medium">Storefront demo · Sample products and prices</p>
          {/* tabIndex allows the skip link to move focus here */}
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/login" element={<Navigate to="/about" replace />} />
                <Route path="/register" element={<Navigate to="/about" replace />} />
                <Route path="/learn-more" element={<Navigate to="/about" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </CartProvider>
  </ErrorBoundary>
);

export default App;
