import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, Calendar, ArrowRight, Clock, Share2, Bookmark } from "lucide-react";
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
            <div className="pt-28 pb-16 bg-background">
                <div className="container mx-auto px-4">
                    {/* Standardized Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-2xl"
                        >
                            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase tracking-[0.2em] text-[10px] font-black">
                                Industry Insights
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                                Today's <span className="text-primary italic">News Updates</span>
                            </h1>
                            <p className="text-muted-foreground mt-4 text-base font-light">
                                Market trends, jewelry industry insights, and latest updates from Gold Jeweltech.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 px-6 py-3 bg-muted/30 rounded-2xl border border-border/50 text-muted-foreground"
                        >
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Updated Daily</span>
                        </motion.div>
                    </div>

                    {/* Standardized Content Grid */}
                    {loading ? (
                        <div className="standard-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="small-card flex flex-col bg-card h-full">
                                    <Skeleton className="aspect-[4/3] w-full" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
                            <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No news updates at the moment.</p>
                        </div>
                    ) : (
                        <motion.div
                            className="standard-grid"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {news.map((item) => (
                                <motion.article
                                    key={item.id}
                                    variants={fadeInUp}
                                    className="group small-card flex flex-col bg-card h-full border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/today-news/${item.id}`)}
                                >
                                    <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Newspaper className="w-10 h-10 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-background/90 text-foreground backdrop-blur-md border border-white/20 text-[10px] py-0 px-2 h-5">
                                                {new Date(item.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <h2 className="text-base font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 h-[3rem] leading-snug">
                                            {item.title}
                                        </h2>

                                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-4 flex-grow h-[3rem]">
                                            {item.content}
                                        </p>

                                        <div className="pt-4 border-t border-border/10 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                    {new Date(item.created_at).getFullYear()}
                                                </span>
                                            </div>
                                            <span className="text-primary text-xs font-bold flex items-center gap-1 group/btn transition-all">
                                                Read More
                                                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                                            </span>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default TodayNews;
