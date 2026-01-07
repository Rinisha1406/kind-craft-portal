import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    MapPin,
    Sparkles,
    Users,
    ArrowRight,
    Filter,
    Package,
    Loader2,
    ExternalLink,
    Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommunityService {
    id: string;
    title: string;
    description: string;
    price: string;
    category: string;
    image_url: string;
    provider_name: string;
    created_at: string;
}

const CommunityServices = () => {
    const [services, setServices] = useState<CommunityService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch(`http://localhost/kind-craft-portal/api/member_services.php`);
            const result = await response.json();
            if (result.data) {
                setServices(result.data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ["All", ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <MainLayout>
            <div className="min-h-screen bg-zinc-950">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gold/5" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            <Badge variant="outline" className="mb-6 border-gold/30 text-gold uppercase tracking-widest px-4 py-1">
                                Community Marketplace
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-champagne mb-6">
                                Discover Services from <span className="text-gold-gradient">Our Community</span>
                            </h1>
                            <p className="text-lg text-champagne/60 leading-relaxed mb-10">
                                Support fellow members by exploring professional services offered directly by our trusted community.
                                From photography to professional consulting, find excellence within.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-2xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50" />
                                <Input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="What service are you looking for today?"
                                    className="h-16 pl-12 pr-4 bg-white/5 border-gold/20 focus:border-gold/50 text-champagne text-lg rounded-2xl shadow-xl backdrop-blur-sm"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Filters & Grid */}
                <section className="pb-24 px-4">
                    <div className="container mx-auto">
                        <div className="flex flex-wrap items-center gap-3 mb-12">
                            <Filter className="w-5 h-5 text-gold mr-2" />
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                            ? "gold-gradient text-emerald-950 font-bold shadow-lg shadow-gold/20"
                                            : "bg-white/5 text-champagne/60 border border-white/10 hover:border-gold/30"
                                        }`}
                                >
                                    {cat || "General"}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                                <p className="text-champagne/40">Opening the marketplace...</p>
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                                <Package className="w-16 h-16 text-gold/20 mx-auto mb-6" />
                                <h3 className="text-2xl font-serif font-bold text-champagne mb-2">No results found</h3>
                                <p className="text-champagne/40">Try adjusting your search or category filters.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group"
                                    >
                                        <div className="bg-charcoal/40 backdrop-blur-sm border border-gold/10 rounded-[2.5rem] overflow-hidden hover:border-gold/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/5 flex flex-col h-full">
                                            {/* Image container */}
                                            <div className="relative h-64 overflow-hidden">
                                                <img
                                                    src={service.image_url || "https://images.unsplash.com/photo-1454165833767-027eeef1526e?w=800"}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-gold/90 text-emerald-950 font-bold backdrop-blur-md">
                                                        {service.category || "Service"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-8 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold/60">
                                                    <Users className="w-3.5 h-3.5" />
                                                    Provided by {service.provider_name || "Community Member"}
                                                </div>
                                                <h3 className="text-2xl font-serif font-bold text-champagne mb-3 group-hover:text-gold transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-gold text-lg font-bold mb-4">{service.price || "Price on Request"}</p>
                                                <p className="text-champagne/50 text-base leading-relaxed line-clamp-3 mb-8 flex-1">
                                                    {service.description || "Dedicated professional service offered to our elite community members."}
                                                </p>

                                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <Button className="gold-gradient text-emerald-950 font-black h-12 px-6 rounded-xl hover:scale-105 transition-transform">
                                                        Contact Provider <Phone className="ml-2 w-4 h-4" />
                                                    </Button>
                                                    <div className="text-[10px] text-white/20 uppercase font-black">
                                                        Listed {new Date(service.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 mb-24">
                    <div className="bg-gold-gradient rounded-[3rem] p-12 text-center shadow-2xl shadow-gold/20">
                        <Sparkles className="w-12 h-12 text-emerald-950 mx-auto mb-6 opacity-30" />
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-emerald-950 mb-4">
                            Have a service to offer?
                        </h2>
                        <p className="text-emerald-950/70 text-lg mb-8 max-w-2xl mx-auto font-medium">
                            Join our network of elite professionals and reach thousands of community members.
                            Start listing your services today.
                        </p>
                        <Button asChild className="bg-emerald-950 text-gold font-bold px-10 h-14 rounded-2xl hover:bg-emerald-900 transition-colors border-none">
                            <a href="/members">Become a Member <ArrowRight className="ml-2 w-5 h-5" /></a>
                        </Button>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
};

export default CommunityServices;
