import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Sparkles, Filter, ChevronRight, Star, Shield, RefreshCw, ArrowRight, MessageCircle } from "lucide-react";
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
  images?: string[];
  is_active: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(
    categoryParam && categories.includes(categoryParam) ? categoryParam : "all"
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryParam && categories.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

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


      {/* Category Filters */}
      <section className="py-4 border-y border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
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
                className={`relative px-6 py-3 rounded-full font-medium text-sm transition-all ${activeCategory === category
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

                      {/* Sold Out Overlay */}
                      {!product.is_active && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
                          <Badge variant="destructive" className="text-lg px-4 py-2 border-2 border-red-200">
                            Sold Out
                          </Badge>
                        </div>
                      )}

                      {/* Hover Overlay - Only if active */}
                      {product.is_active && (
                        <Link to={`/product/${product.id}`} className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6 z-20">
                          <Button size="sm" className="gold-gradient text-primary-foreground shadow-gold">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="p-6">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      {product.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-bold text-2xl">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center relative overflow-hidden group border border-emerald-400/20"
                          onClick={(e) => {
                            e.preventDefault();
                            const phoneNumber = "919876543210";
                            const message = encodeURIComponent(
                              `Hi, I am interested in buying the following product:\n\n*${product.name}*\nPrice: ₹${product.price}\nCategory: ${product.category}\nLink: ${window.location.origin}/product/${product.id}`
                            );
                            window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
                          }}
                          title="Buy on WhatsApp"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                          <MessageCircle className="w-5 h-5 relative z-10" />
                        </motion.button>
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
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-yellow-600 text-charcoal px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Request Custom Design
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Products;
