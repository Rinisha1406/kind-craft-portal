import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Calendar, ArrowRight, Sparkles, AlertCircle, Share2, Bookmark, Clock } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

interface News {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
}

const TodayNews = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { data, error } = await supabase
                    .from("news")
                    .select("*")
                    .eq("is_active", true);

                if (error) throw error;
                setNews(data || []);
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <MainLayout>
            {/* Premium Hero Section */}
            <section className="relative min-h-[60vh] flex items-center pt-24 overflow-hidden bg-charcoal text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(38_70%_45%_/_0.15),_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(160_50%_45%_/_0.1),_transparent_50%)]" />

                {/* Decorative Animated Blobs */}
                <motion.div
                    className="absolute top-1/4 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="max-w-3xl mx-auto"
                    >
                        <motion.div variants={fadeInUp}>
                            <Badge className="mb-6 px-4 py-1.5 bg-gold/10 text-gold border-gold/30 hover:bg-gold/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase">
                                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                                Latest Updates
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-7xl font-serif font-bold text-champagne mb-8 leading-tight"
                        >
                            The World of <span className="text-gold-gradient">Gold & Gems</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-xl text-champagne/70 leading-relaxed mb-10"
                        >
                            Curated daily news, market trends, and exclusive insights from the heart of the jewelry industry.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex justify-center gap-4">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent self-center" />
                            <Clock className="w-5 h-5 text-gold/60" />
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent self-center" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* News Content Section */}
            <section className="py-24 bg-background relative -mt-12 rounded-t-[3rem] z-20 shadow-2xl">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col space-y-4">
                                    <Skeleton className="h-72 w-full rounded-[2rem]" />
                                    <div className="space-y-4 px-4 pt-2">
                                        <Skeleton className="h-8 w-3/4" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : news.length === 0 ? (
                        <motion.div
                            className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50 max-w-4xl mx-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Newspaper className="w-12 h-12 text-gold/40" />
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-foreground mb-4">No News Updates Yet</h3>
                            <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-8">
                                Our team is currently curating fresh insights for you. Please check back shortly.
                            </p>
                            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 rounded-full px-10 h-12 font-medium">
                                Subscribe to Updates
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {news.map((item, idx) => (
                                <motion.article
                                    key={item.id}
                                    variants={fadeInUp}
                                    onClick={() => navigate(`/today-news/${item.id}`)}
                                    className="group relative flex flex-col bg-card h-full rounded-[2.5rem] border border-border/50 hover:border-gold/30 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden shadow-sm cursor-pointer"
                                >
                                    {/* Card Header & Image */}
                                    <div className="h-72 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-500" />
                                        {item.image_url ? (
                                            <motion.img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-charcoal/20 flex items-center justify-center">
                                                <Sparkles className="w-16 h-16 text-gold/10" />
                                            </div>
                                        )}

                                        {/* Action Buttons on Image */}
                                        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2.5 bg-background/80 backdrop-blur-md rounded-2xl text-foreground/70 hover:text-gold shadow-lg transition-colors border border-white/10"
                                            >
                                                <Bookmark className="w-4 h-4" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2.5 bg-background/80 backdrop-blur-md rounded-2xl text-foreground/70 hover:text-gold shadow-lg transition-colors border border-white/10"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </motion.button>
                                        </div>

                                        <div className="absolute bottom-6 left-8 z-20">
                                            <div className="flex items-center gap-3 px-4 py-2 bg-gold text-primary-foreground rounded-full text-xs font-bold shadow-xl shadow-gold/20">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(item.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h2 className="text-2xl font-serif font-bold text-foreground mb-4 leading-snug group-hover:text-gold transition-colors duration-500 line-clamp-2">
                                            {item.title}
                                        </h2>

                                        <p className="text-muted-foreground leading-relaxed mb-8 flex-grow line-clamp-3 text-[0.95rem]">
                                            {item.content}
                                        </p>

                                        <div className="pt-6 border-t border-border/10 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold font-serif border border-gold/20">
                                                    G
                                                </div>
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest italic font-serif">Gold Jeweltech</span>
                                            </div>
                                            <Button variant="ghost" className="text-gold font-bold p-0 hover:bg-transparent group/btn">
                                                Learn More
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-24 bg-background overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-xl mx-auto p-12 bg-charcoal rounded-[3rem] border border-gold/20 relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                        <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors duration-500" />
                        <h4 className="text-2xl font-serif font-bold text-champagne mb-4 relative z-10">Stay in the Loop</h4>
                        <p className="text-champagne/60 mb-8 relative z-10 leading-relaxed">
                            Join our exclusive inner circle to receive weekly highlights of the most important stories.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
                            />
                            <Button className="gold-gradient text-primary-foreground rounded-2xl px-8 h-14 shadow-gold font-bold">
                                Join Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default TodayNews;
