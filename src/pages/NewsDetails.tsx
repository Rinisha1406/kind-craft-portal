import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Share2, Bookmark, Clock, Sparkles } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface News {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
}

const NewsDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchNewsDetails = async () => {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from("news")
                    .select("*")
                    .eq("id", id)
                    .eq("is_active", true)
                    .single();

                if (error) throw error;
                setNews(data);
            } catch (error) {
                console.error("Error fetching news details:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetails();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <Skeleton className="h-12 w-32 mb-8" />
                        <Skeleton className="h-[500px] w-full rounded-[3rem] mb-8" />
                        <Skeleton className="h-16 w-3/4 mb-4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !news) {
        return (
            <MainLayout>
                <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-12 h-12 text-gold/40" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">News Not Found</h2>
                        <p className="text-muted-foreground mb-8">
                            The news article you're looking for doesn't exist or has been removed.
                        </p>
                        <Button
                            onClick={() => navigate("/today-news")}
                            className="gold-gradient text-primary-foreground rounded-full px-8 h-12 font-bold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to News
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Hero Section with Image */}
            <section className="relative min-h-[70vh] flex items-end pt-24 pb-16 overflow-hidden bg-charcoal">
                {/* Background Image */}
                {news.image_url ? (
                    <div className="absolute inset-0">
                        <img
                            src={news.image_url}
                            alt={news.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/40" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-charcoal/90" />
                )}

                {/* Decorative Elements */}
                <motion.div
                    className="absolute top-1/4 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />

                <div className="container mx-auto px-4 relative z-10 max-w-5xl">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Button
                            onClick={() => navigate("/today-news")}
                            variant="ghost"
                            className="text-champagne/80 hover:text-champagne hover:bg-white/10 rounded-full px-6 h-12 backdrop-blur-md border border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to News
                        </Button>
                    </motion.div>

                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-2 text-sm text-champagne/60 mb-6"
                    >
                        <span className="hover:text-gold cursor-pointer" onClick={() => navigate("/")}>Home</span>
                        <span>/</span>
                        <span className="hover:text-gold cursor-pointer" onClick={() => navigate("/today-news")}>News</span>
                        <span>/</span>
                        <span className="text-champagne/80 line-clamp-1">{news.title}</span>
                    </motion.div>

                    {/* Date Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-6"
                    >
                        <Badge className="px-4 py-2 bg-gold text-primary-foreground rounded-full text-sm font-bold shadow-xl shadow-gold/20">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(news.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </Badge>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-champagne mb-8 leading-tight"
                    >
                        {news.title}
                    </motion.h1>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex gap-3"
                    >
                        <Button
                            variant="ghost"
                            className="text-champagne/80 hover:text-champagne hover:bg-white/10 rounded-full px-6 h-12 backdrop-blur-md border border-white/10"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-champagne/80 hover:text-champagne hover:bg-white/10 rounded-full px-6 h-12 backdrop-blur-md border border-white/10"
                        >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 bg-background relative -mt-12 rounded-t-[3rem] z-20 shadow-2xl">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.article
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="prose prose-lg max-w-none"
                    >
                        {/* Author Info */}
                        <div className="flex items-center gap-4 mb-12 pb-8 border-b border-border/30">
                            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xl font-bold font-serif border-2 border-gold/20">
                                G
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-lg mb-1">Gold Jeweltech</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(news.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-foreground leading-relaxed space-y-6 text-lg">
                            {news.content.split('\n').map((paragraph, index) => (
                                paragraph.trim() && (
                                    <p key={index} className="mb-6">
                                        {paragraph}
                                    </p>
                                )
                            ))}
                        </div>

                        {/* Tags/Categories (if you add them later) */}
                        <div className="mt-16 pt-8 border-t border-border/30">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm">
                                    Gold Market
                                </Badge>
                                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm">
                                    Jewelry Industry
                                </Badge>
                                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-sm">
                                    News
                                </Badge>
                            </div>
                        </div>
                    </motion.article>

                    {/* Back to News Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-16 text-center"
                    >
                        <Button
                            onClick={() => navigate("/today-news")}
                            className="gold-gradient text-primary-foreground rounded-full px-10 h-14 font-bold shadow-gold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to All News
                        </Button>
                    </motion.div>
                </div>
            </section>
        </MainLayout>
    );
};

export default NewsDetails;
