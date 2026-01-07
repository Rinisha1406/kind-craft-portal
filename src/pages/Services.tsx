import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gem, Heart, Users, PenTool, RefreshCw, ArrowRight, ShieldCheck, Sparkles, Moon, Star, Sun, Cloud, Music, Camera, Gift } from "lucide-react"; // Import all generic icons possibly used
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import heroImage from "@/assets/services-hero.png";
import { supabase } from "@/integrations/supabase/client";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};


// Map string names to Lucide components
const IconMap: any = {
    // Kept for reference or future use if needed, but not used in render loop anymore
    Gem, Heart, Users, PenTool, RefreshCw, ShieldCheck, Sparkles, Moon, Star, Sun, Cloud, Music, Camera, Gift
};

interface Service {
    id: string;
    title: string;
    description: string;
    image_url: string;
    features: string[];
}

const Services = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Fetch public services (active only) via our PHP API wrapper logic which we know supports filters
                // Actually supabase client here calls the PHP endpoint.
                // Our PHP endpoint `api/services.php` handles filtering if we pass query params.
                // The supabase client `from('services')` is mapped to GET `api/services.php`
                // `eq('is_active', true)` maps to `?is_active=true`

                const { data, error } = await supabase
                    .from("services")
                    .select("*")
                    .eq('is_active', true)
                    .order('created_at', { ascending: true }); // We created display_order but didn't expose it in Admin yet, default to created_at or just order by ID

                if (error) throw error;
                setServices(data || []);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img src={heroImage} alt="Services Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
                </div>

                {/* Animated decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-20 right-20 w-64 h-64 gold-gradient rounded-full blur-3xl opacity-20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-32 right-1/3 w-48 h-48 bg-rose-gold rounded-full blur-3xl opacity-20"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.25, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        className="max-w-3xl"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        <motion.span
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm text-gold border border-gold/30 rounded-full text-sm font-medium mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            Excellence in Every Detail
                        </motion.span>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-champagne mb-6 leading-tight"
                        >
                            Our Premium <span className="block text-gold-gradient">Services</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-champagne/80 mb-8 max-w-2xl leading-relaxed"
                        >
                            Beyond exquisite jewelry, we offer a suite of services designed to celebrate your life's most cherished moments, from finding your soulmate to preserving your family's legacy.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Main Services List */}
            <section className="py-20 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center text-gold py-20">Loading our services...</div>
                    ) : services.length === 0 ? (
                        <div className="text-center text-muted-foreground py-20">No active services at the moment.</div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {services.map((service) => (
                                <motion.div
                                    key={service.id}
                                    variants={fadeInUp}
                                    className="group bg-card/30 rounded-3xl overflow-hidden border border-border/50 hover:border-gold/30 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5 flex flex-col h-full"
                                >
                                    {/* Image Section */}
                                    <div className="h-64 overflow-hidden relative bg-black/20">
                                        {service.image_url ? (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 transition-opacity duration-500 group-hover:opacity-40" />
                                                <img
                                                    src={service.image_url}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-charcoal/50 group-hover:bg-charcoal/40 transition-colors">
                                                <Sparkles className="w-12 h-12 text-gold/20" />
                                            </div>
                                        )}
                                        {/* Icon Overlay (Optional decoration) */}
                                        <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-gold/20 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-gold" />
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h2 className="text-2xl font-serif font-bold text-foreground mb-4 group-hover:text-gold transition-colors">
                                            {service.title}
                                        </h2>

                                        <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                                            {service.description}
                                        </p>

                                        {service.features && service.features.length > 0 && (
                                            <div className="pt-6 border-t border-border/10">
                                                <ul className="space-y-3">
                                                    {service.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                                                            <div className="min-w-[5px] h-[5px] rounded-full bg-gold mt-2" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
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

export default Services;

