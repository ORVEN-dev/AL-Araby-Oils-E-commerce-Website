import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroOils from "@/assets/hero-skincare.jpg";
import heroBeauty from "@/assets/hero-beauty.jpg";
import heroHerbs from "@/assets/hero-herbs.jpg";

const slides = [
  {
    image: heroOils,
    alt: "Premium natural skincare oils and beauty products"
  },
  {
    image: heroBeauty,
    alt: "Organic beauty and wellness collection"
  },
  {
    image: heroHerbs,
    alt: "Natural herbs and aromatherapy products"
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // WCAG 2.2.2: no auto-advance while paused or when the user asked for less motion
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative h-[600px] lg:h-[700px] xl:h-[850px] overflow-hidden bg-secondary"
      aria-label="Hero slideshow showcasing natural beauty products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={index !== currentSlide}
        >
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Scrim carries the headline contrast: the green "& Wellness" line
                measures 1.11:1 on slide 2 against a weaker gradient. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-lg text-white">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Natural Beauty
                <br />
                <span className="text-primary">& Wellness</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed">
                Discover the power of pure herbal ingredients for your health and beauty care
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Buttons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-lg">
            <div className="flex gap-4 pointer-events-auto" style={{ marginTop: "280px" }}>
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg transition-smooth"
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="/learn-more">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-primary hover:bg-white hover:text-foreground px-8 py-6 text-lg rounded-full transition-smooth"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2"
        role="group"
        aria-label="Slideshow navigation"
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            /* before:-inset-3 pads the 8px dot out to a 32px hit target (WCAG 2.5.8) */
            className={`relative h-2 rounded-full transition-all before:absolute before:-inset-3 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2"
            }`}
            aria-current={index === currentSlide}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;