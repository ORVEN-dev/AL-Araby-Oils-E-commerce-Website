import { Product } from "@/types/product";
import arganOilImg from "@/assets/product-argan-oil.jpg";
import hairSerumImg from "@/assets/product-hair-serum.jpg";
import lavenderSetImg from "@/assets/product-lavender-set.jpg";
import roseToner from "@/assets/product-rose-toner.jpg";
import herbsImg from "@/assets/hero-herbs.jpg";
import oilsImg from "@/assets/hero-oils-1.jpg";
import skincareImg from "@/assets/hero-skincare.jpg";
import supplementsImg from "@/assets/hero-supplements.jpg";
import beautyImg from "@/assets/hero-beauty.jpg";

/**
 * The discount badge is derived from the two prices, never hand-written.
 * It used to be a separate field and had already drifted: id 1 is 28.99 down
 * from 34.99 — 17% — but was badged 15%.
 */
const withDiscount = (product: Omit<Product, "discount">): Product => ({
  ...product,
  discount: product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : undefined,
});

const catalogue: Omit<Product, "discount">[] = [
  {
    id: "1",
    name: "Argan Oil",
    description: "An argan oil example in the oils collection.",
    price: 28.99,
    originalPrice: 34.99,
    image: arganOilImg,
    category: "Oils",
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Lavender Essential Oil Set",
    description: "A set of lavender oils in the aromatherapy collection.",
    price: 39.99,
    originalPrice: 49.99,
    image: lavenderSetImg,
    category: "Aromatherapy",
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Herbal Rose Water Toner",
    description: "A rose water toner in the skin care collection.",
    price: 19.99,
    originalPrice: 24.99,
    image: roseToner,
    category: "Skin Care",
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Herbal Hair Serum",
    description: "A botanical serum in the hair care collection.",
    price: 24.99,
    originalPrice: 29.99,
    image: hairSerumImg,
    category: "Hair Care",
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Chamomile Tea Blend",
    description: "A dried chamomile blend in the herbs collection.",
    price: 15.99,
    originalPrice: 19.99,
    image: herbsImg,
    illustrativeImage: true,
    category: "Herbs",
    inStock: true,
  },
  {
    id: "6",
    name: "Peppermint Essential Oil",
    description: "A peppermint oil example in the oils collection.",
    price: 18.99,
    originalPrice: 22.99,
    image: oilsImg,
    illustrativeImage: true,
    category: "Oils",
    inStock: true,
  },
  {
    id: "7",
    name: "Green Tea Face Mask",
    description: "A green tea mask in the skin care collection.",
    price: 22.99,
    image: skincareImg,
    illustrativeImage: true,
    category: "Skin Care",
    inStock: true,
  },
  {
    id: "8",
    name: "Coconut Oil Hair Treatment",
    description: "A coconut oil treatment in the hair care collection.",
    price: 16.99,
    image: beautyImg,
    illustrativeImage: true,
    category: "Hair Care",
    inStock: true,
  },
  {
    id: "9",
    name: "Turmeric Powder",
    description: "Ground turmeric in the herbs collection.",
    price: 12.99,
    image: herbsImg,
    illustrativeImage: true,
    category: "Herbs",
    inStock: true,
  },
  {
    id: "10",
    name: "Vitamin C Serum",
    description: "A vitamin C serum in the skin care collection.",
    price: 32.99,
    image: skincareImg,
    illustrativeImage: true,
    category: "Skin Care",
    inStock: true,
  },
  {
    id: "11",
    name: "Rosemary Hair Oil",
    description: "A rosemary oil example in the hair care collection.",
    price: 21.99,
    image: oilsImg,
    illustrativeImage: true,
    category: "Hair Care",
    inStock: true,
  },
  {
    id: "12",
    name: "Omega-3 Fish Oil Capsules",
    description: "An omega-3 capsule example in the supplements collection.",
    price: 29.99,
    image: supplementsImg,
    illustrativeImage: true,
    category: "Supplements",
    inStock: true,
  },
];

export const products: Product[] = catalogue.map(withDiscount);

export const categories = [
  {
    id: "herbs",
    name: "Premium Herbs",
    description: "Browse teas, spices and dried botanicals.",
    image: herbsImg,
    icon: "leaf",
  },
  {
    id: "oils",
    name: "Essential Oils",
    description: "Browse the sample oils collection.",
    image: oilsImg,
    icon: "droplet",
  },
  {
    id: "skincare",
    name: "Skin Care",
    description: "Explore example toners, serums and masks.",
    image: skincareImg,
    icon: "sparkles",
  },
  {
    id: "aromatherapy",
    name: "Aromatherapy",
    description: "Explore sample fragrance and essential oil sets.",
    image: beautyImg,
    icon: "wind",
  },
];
