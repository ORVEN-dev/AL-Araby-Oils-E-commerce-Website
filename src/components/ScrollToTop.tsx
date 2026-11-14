import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // `search` too: /shop?category=Oils → /shop?category=Herbs is the same pathname,
  // so keying on pathname alone left the user mid-grid on every filter change.
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;