import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Moon, Sun, Sparkles, AlertCircle, Calendar, Compass, Info } from "lucide-react";
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

interface RasiPalan {
    id: string;
    title: string;
    content: string;
    lucky_color: string | null;
    lucky_number: string | null;
    created_at: string;
}

const TodayRasiPalan = () => {
    const [rasiPalan, setRasiPalan] = useState<RasiPalan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRasiPalan = async () => {
            try {
                const { data, error } = await supabase
                    .from("rasi_palan")
                    .select("*")
                    .eq("is_active", true);

                if (error) throw error;
                setRasiPalan(data || []);
            } catch (error) {
                console.error("Error fetching rasi palan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRasiPalan();
    }, []);

    return (
        <MainLayout>
            {/* Brand-Aligned Hero Section */}
            <section className="relative min-h-[50vh] flex items-center pt-24 overflow-hidden bg-charcoal text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,175,55,0.1),_transparent_70%)]" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="max-w-3xl mx-auto"
                    >
                        <motion.div variants={fadeInUp}>
                            <Badge className="mb-6 px-4 py-1.5 bg-gold/10 text-gold border-gold/30 hover:bg-gold/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase">
                                <Compass className="w-3.5 h-3.5 mr-2 inline-block" />
                                Celestial Guidance
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-6xl font-serif font-bold text-champagne mb-6 leading-tight"
                        >
                            Today's <span className="text-gold-gradient">Rasi Palan</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-champagne/70 leading-relaxed mb-10 max-w-2xl mx-auto"
                        >
                            Align your day with the movement of the stars. Discover your personalized daily guidance and celestial insights.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="flex justify-center items-center gap-4 text-gold/40"
                        >
                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                            <div className="flex gap-4">
                                <Sun className="w-5 h-5" />
                                <Moon className="w-5 h-5" />
                                <Star className="w-5 h-5" />
                            </div>
                            <div className="h-px w-20 bg-gradient-to-l from-transparent via-gold/50 to-transparent" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Rasi Palan Content Grid */}
            <section className="py-20 bg-background relative -mt-12 rounded-t-[3rem] z-20 shadow-2xl">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-foreground">Daily Predictions</h2>
                            <p className="text-muted-foreground mt-1">Insights for all zodiac signs</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50 text-foreground text-sm font-medium">
                            <Calendar className="w-4 h-4 text-gold" />
                            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />
                            ))}
                        </div>
                    ) : rasiPalan.length === 0 ? (
                        <motion.div
                            className="text-center py-24 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50 max-w-4xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-gold/40" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-foreground mb-3">Insights Pending</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Check back shortly. Our team is currently updating today's celestial insights.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {rasiPalan.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={fadeInUp}
                                    className="group relative p-8 bg-card rounded-[2.5rem] border border-border/50 hover:border-gold/30 transition-all duration-500 hover:shadow-xl flex flex-col h-full shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 transform group-hover:scale-110 transition-transform">
                                            <Moon className="w-6 h-6 text-primary-foreground" />
                                        </div>
                                        <Badge variant="outline" className="text-muted-foreground/60 p-0 hover:bg-transparent border-none">
                                            <Info className="w-4 h-4" />
                                        </Badge>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4 group-hover:text-gold transition-colors">
                                        {item.title}
                                    </h2>

                                    <div className="text-muted-foreground leading-relaxed mb-8 flex-grow text-[0.95rem]">
                                        {item.content}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-border/10">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Lucky Color</p>
                                                <p className="text-xs font-semibold text-foreground italic font-serif">{item.lucky_color || 'Not Specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Lucky Number</p>
                                                <p className="text-xs font-semibold text-foreground italic font-serif">{item.lucky_number || 'Not Specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>
        </MainLayout>
    );
};

export default TodayRasiPalan;
