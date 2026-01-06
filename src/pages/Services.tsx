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
                            className="grid gap-16"
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {services.map((service, index) => {
                                const isEven = index % 2 === 0;

                                // Alternate layout for large feature blocks
                                // We can use a simpler grid for items without images or specific ones
                                // For now, let's use a consistent rich card layout

                                return (
                                    <motion.div
                                        key={service.id}
                                        variants={fadeInUp}
                                        className="group grid md:grid-cols-2 gap-8 items-center bg-card/30 rounded-3xl p-8 border border-border/50 hover:border-gold/30 transition-all duration-500"
                                    >
                                        <div className={`space-y-6 ${!isEven ? "md:order-2" : "md:order-1"}`}>
                                            <h2 className="text-3xl font-serif font-bold text-foreground">{service.title}</h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                {service.description}
                                            </p>

                                            {service.features && service.features.length > 0 && (
                                                <ul className="space-y-3">
                                                    {service.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-center gap-3 text-foreground/80">
                                                            <ShieldCheck className="w-5 h-5 text-gold" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                        </div>

                                        <div className={`${!isEven ? "md:order-1" : "md:order-2"} h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative bg-black/20`}>
                                            {service.image_url ? (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent mix-blend-overlay z-10" />
                                                    <img
                                                        src={service.image_url}
                                                        alt={service.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-charcoal/50">
                                                    <span className="text-gold/20 font-serif text-4xl">{service.title.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </section>
        </MainLayout>
    );
};

export default Services;

