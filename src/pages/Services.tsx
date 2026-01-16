import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gem, Heart, Users, PenTool, RefreshCw, ArrowRight, ShieldCheck, Sparkles, Moon, Star, Sun, Cloud, Music, Camera, Gift, MessageCircle } from "lucide-react"; // Import all generic icons possibly used
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import heroImage from "@/assets/services-hero.png";
import { supabase } from "@/integrations/supabase/client";
import { Check, Filter, X, PlusCircle } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
    price?: string;
    category?: string;
    provider_name?: string;
}

const Services = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Derive unique categories
    const uniqueCategories = Array.from(new Set(services.map(s => s.category || "General"))).sort();

    // Filter services
    const filteredServices = services.filter(service => {
        if (selectedCategories.length === 0) return true;
        return selectedCategories.includes(service.category || "General");
    });

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

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
                    .select("*, members(full_name)")
                    .eq('is_active', true)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                const mappedData = data?.map((s: any) => ({
                    ...s,
                    provider_name: s.members?.full_name || "Official"
                }));
                setServices(mappedData || []);
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

            {/* Main Services List */}
            <section className="py-20 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">

                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div className="flex items-center gap-2">
                            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 border-gold/30 hover:bg-gold/10 hover:text-gold text-muted-foreground">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter Categories
                                        {selectedCategories.length > 0 && (
                                            <>
                                                <Separator orientation="vertical" className="mx-2 h-4 bg-gold/30" />
                                                <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-gold/20 text-gold lg:hidden">
                                                    {selectedCategories.length}
                                                </Badge>
                                                <div className="hidden space-x-1 lg:flex">
                                                    {selectedCategories.length > 2 ? (
                                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-gold/20 text-gold">
                                                            {selectedCategories.length} selected
                                                        </Badge>
                                                    ) : (
                                                        selectedCategories.map((cat) => (
                                                            <Badge
                                                                variant="secondary"
                                                                key={cat}
                                                                className="rounded-sm px-1 font-normal bg-gold/20 text-gold"
                                                            >
                                                                {cat}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[240px] p-0 bg-charcoal border-gold/20" align="start">
                                    <Command className="bg-charcoal text-champagne">
                                        <CommandInput placeholder="Search categories..." className="h-9 border-none focus:ring-0 text-champagne placeholder:text-champagne/40" />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                {uniqueCategories.map((category) => {
                                                    const isSelected = selectedCategories.includes(category);
                                                    return (
                                                        <CommandItem
                                                            key={category}
                                                            onSelect={() => toggleCategory(category)}
                                                            className="text-champagne aria-selected:bg-white/10"
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gold/50",
                                                                    isSelected
                                                                        ? "bg-gold text-charcoal"
                                                                        : "opacity-50 [&_svg]:invisible"
                                                                )}
                                                            >
                                                                <Check className={cn("h-4 w-4")} />
                                                            </div>
                                                            {category}
                                                            <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs text-muted-foreground">
                                                                {services.filter(s => (s.category || "General") === category).length}
                                                            </span>
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                            {selectedCategories.length > 0 && (
                                                <>
                                                    <CommandSeparator className="bg-gold/10" />
                                                    <CommandGroup>
                                                        <CommandItem
                                                            onSelect={() => setSelectedCategories([])}
                                                            className="justify-center text-center text-gold aria-selected:bg-gold/10"
                                                        >
                                                            Clear filters
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </>
                                            )}
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {selectedCategories.length > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedCategories([])}
                                    className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-red-400"
                                >
                                    Reset
                                    <X className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredServices.length} result{filteredServices.length !== 1 && 's'}
                        </div>
                    </div>

                    {loading ? (
                        <div className="standard-grid">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="small-card aspect-square animate-pulse bg-muted" />
                            ))}
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center text-muted-foreground py-20">No active services at the moment.</div>
                    ) : (
                        <motion.div
                            className="standard-grid"
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {filteredServices.map((service) => (
                                <motion.div
                                    key={service.id}
                                    variants={fadeInUp}
                                    className="group small-card"
                                >
                                    {/* Image Section */}
                                    <div className="aspect-square overflow-hidden relative bg-black/20">
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
                                        {/* Category Badge */}
                                        <Badge className="absolute top-2 right-2 text-[10px] px-2 py-0 h-5 bg-gold/20 text-gold border-gold/30 backdrop-blur-md">
                                            {service.category || "General"}
                                        </Badge>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h2 className="text-base font-serif font-bold text-foreground mb-1 group-hover:text-gold transition-colors line-clamp-1">
                                            {service.title}
                                        </h2>
                                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 h-8 mb-3">
                                            {service.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-primary font-bold text-sm">{service.price || "Price on Request"}</span>
                                                {service.provider_name && (
                                                    <span className="text-[9px] text-muted-foreground italic">By {service.provider_name}</span>
                                                )}
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center relative overflow-hidden group/btn border border-emerald-400/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const phoneNumber = "919514879417";
                                                    const message = encodeURIComponent(`Hi, I'm interested in the service: ${service.title}`);
                                                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
                                                }}
                                                title="Enquire on WhatsApp"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                                                <MessageCircle className="w-4 h-4 relative z-10" />
                                            </motion.button>
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

export default Services;

