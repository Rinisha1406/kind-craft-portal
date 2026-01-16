import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
  id?: string;
}

const categoryColors: Record<string, string> = {
  gold: "bg-gold text-primary-foreground",
  silver: "bg-silver text-charcoal",
  diamond: "bg-diamond text-charcoal",
  platinum: "bg-platinum text-charcoal",
  gemstone: "bg-rose-gold text-primary-foreground",
  "Chidhanbaram Mumbai Bengal Gold": "bg-gold text-primary-foreground",
  "Covering & Fashion Jewel": "bg-rose-gold text-primary-foreground",
  "Imported Jewels": "bg-platinum text-charcoal",
  "Herbal-care product": "bg-emerald-600 text-white",
  "Ayurvedha-Sidha-Homeo-product": "bg-emerald-700 text-white",
  "SKIN. Hair & BeautyiCare": "bg-pink-500 text-white",
  "ORGANICS, SPICES, Nuts & Dates": "bg-amber-700 text-white",
  "GROCERIES & Home FARE Product": "bg-zinc-700 text-white",
};

const ProductCard = ({ name, price, category, imageUrl, description, id }: ProductCardProps) => {
  return (
    <div className="group small-card">
      <div className="aspect-square bg-muted overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
            <span className="text-3xl font-serif text-muted-foreground/30">✦</span>
          </div>
        )}
        <Badge className={`absolute top-2 right-2 text-[10px] px-2 py-0 h-5 ${categoryColors[category] || "bg-primary text-primary-foreground"}`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-muted-foreground text-xs mb-2 line-clamp-2 leading-relaxed h-8">{description}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-primary font-bold text-lg">
            ₹{price.toLocaleString("en-IN")}
          </p>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center relative overflow-hidden group/btn border border-emerald-400/20"
            onClick={(e) => {
              e.preventDefault();
              const phoneNumber = "919514879417";
              const message = encodeURIComponent(
                `Hi, I am interested in buying the following product:\n\n*${name}*\nPrice: ₹${price}\nCategory: ${category}${id ? `\nLink: ${window.location.origin}/product/${id}` : ''}`
              );
              window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
            }}
            title="Buy on WhatsApp"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            <MessageCircle className="w-4 h-4 relative z-10" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
