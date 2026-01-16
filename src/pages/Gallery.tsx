import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Play, Maximize2, X } from "lucide-react";

interface GalleryItem {
    id: string;
    type: "image" | "youtube";
    url: string;
    title: string | null;
    is_active: boolean | number;
}

const Gallery = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const { data, error } = await supabase.from("gallery").select("*").eq("is_active", 1);
            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error("Error fetching gallery:", error);
        } finally {
            setLoading(false);
        }
    };

    const getYouTubeThumbnail = (url: string) => {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    const getImageUrl = (url: string) => {
        return supabase.storage.from("uploads").getPublicUrl(url).data.publicUrl;
    };

    return (
        <MainLayout>
            <div className="pt-24 pb-16 min-h-screen bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-serif font-bold mb-4"
                        >
                            Our Gallery
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground text-lg"
                        >
                            Explore our collections through stunning imagery and cinematic showcases.
                        </motion.p>
                    </div>

                    {loading ? (
                        <div className="standard-grid">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="standard-grid">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative aspect-square small-card cursor-pointer"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <img
                                        src={item.type === "image" ? getImageUrl(item.url) : getYouTubeThumbnail(item.url)}
                                        alt={item.title || ""}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        {item.type === "youtube" ? (
                                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                                <Play className="text-white fill-white ml-1" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                <Maximize2 className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    {item.title && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                            <p className="font-serif text-sm line-clamp-1">{item.title}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox / Video Player */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
                            onClick={() => setSelectedItem(null)}
                        >
                            <X size={32} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-5xl w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedItem.type === "image" ? (
                                <img
                                    src={getImageUrl(selectedItem.url)}
                                    alt={selectedItem.title || ""}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <iframe
                                    src={`https://www.youtube.com/embed/${selectedItem.url.split('v=')[1]?.split('&')[0] || selectedItem.url.split('/').pop()}?autoplay=1`}
                                    title={selectedItem.title || "YouTube video"}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MainLayout>
    );
};

export default Gallery;
