import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Sparkles, Filter, ChevronRight, Star, Shield, RefreshCw } from "lucide-react";
import productsHero from "@/assets/products-hero.jpg";

const categories = ["all", "gold", "silver", "diamond", "platinum", "gemstone"];

const categoryInfo: Record<string, { color: string; icon: string; desc: string }> = {
  gold: { color: "bg-gold text-primary-foreground", icon: "✦", desc: "22K & 24K Pure Gold" },
  silver: { color: "bg-silver text-charcoal", icon: "◇", desc: "Sterling Silver 925" },
  diamond: { color: "bg-diamond text-charcoal", icon: "◆", desc: "VVS Certified Diamonds" },
  platinum: { color: "bg-platinum text-charcoal", icon: "○", desc: "Pure Platinum" },
  gemstone: { color: "bg-rose-gold text-primary-foreground", icon: "❖", desc: "Precious Gemstones" },
};

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  image_url: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={productsHero} alt="Jewelry Collection" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              Handcrafted with Love
            </motion.span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
              Our Exquisite
              <span className="text-gold-gradient block">Collection</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Each piece tells a story of tradition, craftsmanship, and timeless elegance. 
              Discover jewelry that becomes part of your family's legacy.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {[
                { icon: Shield, text: "BIS Hallmarked" },
                { icon: Star, text: "Premium Quality" },
                { icon: RefreshCw, text: "Lifetime Exchange" },
              ].map((badge, i) => (
                <motion.div 
                  key={badge.text}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  {badge.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-6 border-y border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4 lg:hidden">
            <Filter className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Filter by Category</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative px-6 py-3 rounded-full font-medium text-sm transition-all ${
                  activeCategory === category
                    ? "gold-gradient text-primary-foreground shadow-gold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
                {activeCategory === category && (
                  <motion.span
                    className="absolute inset-0 rounded-full gold-gradient -z-10"
                    layoutId="activeCategory"
                  />
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Category Description */}
          {activeCategory !== "all" && categoryInfo[activeCategory] && (
            <motion.p 
              className="text-center text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {categoryInfo[activeCategory].desc}
            </motion.p>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-gold transition-all duration-500"
                    whileHover={{ y: -10 }}
                  >
                    <div className="aspect-square bg-muted overflow-hidden relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                          <motion.span 
                            className="text-6xl text-muted-foreground/30"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            {categoryInfo[product.category]?.icon || "✦"}
                          </motion.span>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <Badge className={`absolute top-4 right-4 ${categoryInfo[product.category]?.color || "bg-primary text-primary-foreground"}`}>
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </Badge>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                        <Button size="sm" className="gold-gradient text-primary-foreground shadow-gold">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-bold text-2xl">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="text-8xl mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <h3 className="text-3xl font-serif font-semibold text-foreground mb-4">
                No Products Found
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {activeCategory === "all"
                  ? "Check back soon for our latest collections."
                  : `No ${activeCategory} products available at the moment. Try another category!`}
              </p>
              <Button onClick={() => setActiveCategory("all")} variant="outline">
                View All Products
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Custom Order CTA */}
      <section className="py-20 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(38_70%_45%_/_0.1),_transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif font-bold text-champagne mb-4">
              Looking for Something Unique?
            </h2>
            <p className="text-champagne/70 max-w-xl mx-auto mb-8">
              We create custom jewelry designs tailored to your vision. Let our master craftsmen 
              bring your dream piece to life.
            </p>
            <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold hover:scale-105 transition-transform">
              Request Custom Design
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Products;
