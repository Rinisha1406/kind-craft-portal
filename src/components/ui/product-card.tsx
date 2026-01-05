import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

const categoryColors: Record<string, string> = {
  gold: "bg-gold text-primary-foreground",
  silver: "bg-silver text-charcoal",
  diamond: "bg-diamond text-charcoal",
  platinum: "bg-platinum text-charcoal",
  gemstone: "bg-rose-gold text-primary-foreground",
};

const ProductCard = ({ name, price, category, imageUrl, description }: ProductCardProps) => {
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 border border-border">
      <div className="aspect-square bg-muted overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <span className="text-4xl font-serif text-muted-foreground/30">✦</span>
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${categoryColors[category] || "bg-primary text-primary-foreground"}`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Badge>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
        )}
        <p className="text-primary font-bold text-xl">
          ₹{price.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
