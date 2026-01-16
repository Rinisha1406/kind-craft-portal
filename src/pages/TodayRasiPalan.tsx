import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Moon, Sun, Sparkles, Calendar, Compass, Info } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
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
                                Celestial Insight
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                                Today's <span className="text-primary italic">Rasi Palan</span>
                            </h1>
                            <p className="text-muted-foreground mt-4 text-base font-light">
                                Align your day with celestial guidance and discover your personalized daily predictions for all zodiac signs.
                            </p>
                        </motion.div>

                        <div className="flex items-center gap-3 px-6 py-3 bg-muted/30 rounded-2xl border border-border/50 text-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">
                                {new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Standardized Content Grid */}
                    {loading ? (
                        <div className="standard-grid">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="small-card h-80 w-full" />
                            ))}
                        </div>
                    ) : rasiPalan.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
                            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">Celestial insights are being updated.</p>
                        </div>
                    ) : (
                        <motion.div
                            className="standard-grid"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {rasiPalan.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={fadeInUp}
                                    className="group small-card flex flex-col bg-card h-full border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden shadow-sm"
                                >
                                    <div className="p-6 flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gold/10 transform group-hover:scale-110 transition-transform">
                                                <Moon className="w-5 h-5 text-primary-foreground" />
                                            </div>
                                            <div className="flex gap-1">
                                                <Sun className="w-3 h-3 text-gold/40" />
                                                <Star className="w-3 h-3 text-gold/40" />
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors tracking-tight">
                                            {item.title}
                                        </h2>

                                        <p className="text-muted-foreground text-xs leading-relaxed mb-6 flex-grow line-clamp-4">
                                            {item.content}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-border/10">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-muted/30 p-2 rounded-lg text-center">
                                                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black mb-0.5">Lucky Color</p>
                                                    <p className="text-[10px] font-bold text-primary truncate">{item.lucky_color || '---'}</p>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded-lg text-center">
                                                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-black mb-0.5">Lucky No.</p>
                                                    <p className="text-[10px] font-bold text-primary">{item.lucky_number || '---'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Subtle Footer-like Quote */}
            <div className="py-20 bg-muted/5 text-center">
                <div className="container mx-auto px-4">
                    <Sparkles className="w-6 h-6 text-gold/20 mx-auto mb-6" />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black">
                        Celestial Wisdom for a Professional Life
                    </p>
                </div>
            </div>
        </MainLayout>
    );
};

export default TodayRasiPalan;
