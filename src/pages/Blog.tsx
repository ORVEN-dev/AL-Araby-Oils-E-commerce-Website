import oilsImage from "@/assets/hero-oils-1.jpg";
import herbsImage from "@/assets/hero-herbs.jpg";
import skinImage from "@/assets/hero-skincare.jpg";
import supplementImage from "@/assets/hero-supplements.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "Argan oil in the catalogue",
      excerpt: "An editorial sample from the storefront concept.",
      category: "Beauty Tips",
      image: oilsImage,
    },
    {
      id: 2,
      title: "Exploring the essential oils collection",
      excerpt: "An editorial sample from the storefront concept.",
      category: "Health & Wellness",
      image: herbsImage,
    },
    {
      id: 3,
      title: "How the skin care collection is organized",
      excerpt: "An editorial sample from the storefront concept.",
      category: "Skincare",
      image: skinImage,
    },
    {
      id: 4,
      title: "Herbs and supplements in the catalogue",
      excerpt: "An editorial sample from the storefront concept.",
      category: "Supplements",
      image: supplementImage,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Catalogue Notes</h1>
        <p className="text-lg text-muted-foreground">
          Short editorial samples for the storefront concept.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-secondary overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <Badge className="mb-3">{post.category}</Badge>
              {/* No cursor-pointer / hover:text-primary here: there is no article
                  route to open, and an affordance that leads nowhere is worse
                  than none. Restore both when /blog/:id exists. */}
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;
