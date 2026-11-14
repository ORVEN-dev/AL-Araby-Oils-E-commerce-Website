import { Link } from "react-router-dom";
import { Leaf, Droplet, Sparkles, Wind, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

const icons = {
  leaf: Leaf,
  droplet: Droplet,
  sparkles: Sparkles,
  wind: Wind,
};

/**
 * A category panel, sized to be scrolled past rather than scanned in a grid.
 *
 * It used to be a small icon-and-two-lines card in a 4-up grid. That version had
 * nothing to scroll horizontally — four cards that already fit the viewport — so
 * the band only became possible once the panels were wide enough to overflow it.
 */
const CategoryCard = ({ name, description, image, icon }: CategoryCardProps) => {
  const Icon = icons[icon as keyof typeof icons] || Leaf;
  const query = name.replace("Premium ", "").replace("Essential ", "");

  return (
    <article className="group relative h-[420px] w-[78vw] shrink-0 overflow-hidden rounded-2xl shadow-lift sm:w-[58vw] lg:h-[540px] lg:w-[38vw]">
      {/* alt="" — the heading below already names the category, so describing the
          photo again would just make a screen reader say it twice. */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      {/* Bottom-weighted scrim: opaque where the copy sits, clearing off the top
          so the photograph is still a photograph. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(162_45%_5%)] via-[hsl(162_45%_6%/0.7)] to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-7 lg:p-9">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
        </span>
        <h3 className="mb-2 text-2xl font-bold text-white lg:text-3xl">{name}</h3>
        <p className="mb-6 max-w-sm text-white/85">{description}</p>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-foreground"
        >
          <Link to={`/shop?category=${query}`}>
            Explore {query}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
};

export default CategoryCard;
