import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle, Shield, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string | null;
    image_url: string | null;
    images?: string[];
    is_active: boolean;
}

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();

            if (error) throw error;
            setProduct(data);
            // Set initial selected image to image_url or first image in array
            if (data) {
                const initialImage = data.image_url || (data.images && data.images.length > 0 ? data.images[0] : null);
                setSelectedImage(initialImage);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppBuy = () => {
        if (!product) return;

        // Replace with actual business number
        const phoneNumber = "919876543210";
        const message = encodeURIComponent(
            `Hi, I am interested in buying the following product:\n\n*${product.name}*\nPrice: ₹${product.price}\nCategory: ${product.category}\nLink: ${window.location.href}`
        );

        window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <div className="grid md:grid-cols-2 gap-12">
                        <Skeleton className="aspect-square rounded-2xl" />
                        <div className="space-y-6">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-8 w-1/4" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-1/3" />
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!product) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-serif text-foreground mb-4">Product Not Found</h2>
                    <Link to="/products">
                        <Button variant="outline">Back to Collection</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    // Prepare images array for gallery
    const galleryImages = product.images && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : []);

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Collection
                </Link>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border shadow-card">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                    <span className="text-6xl">✦</span>
                                </div>
                            )}

                            {!product.is_active && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <Badge variant="destructive" className="text-2xl px-6 py-3 border-2 border-red-200">
                                        Sold Out
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {galleryImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === img
                                                ? "border-primary shadow-lg ring-2 ring-primary/20"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-8">
                        <div>
                            <Badge variant="outline" className="mb-4 text-gold border-gold/30 uppercase tracking-widest text-xs">
                                {product.category}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                                {product.name}
                            </h1>
                            <p className="text-3xl text-primary font-bold">
                                ₹{product.price.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {product.description || "No description available for this exquisite piece."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                            <Button
                                size="lg"
                                className="flex-1 gold-gradient text-primary-foreground shadow-gold hover:scale-105 transition-transform text-lg"
                                onClick={handleWhatsAppBuy}
                                disabled={!product.is_active}
                            >
                                <MessageCircle className="w-5 h-5 mr-3" />
                                {product.is_active ? "Buy on WhatsApp" : "Currently Unavailable"}
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-8">
                            {[
                                { icon: Shield, text: "Certified Authenticity" },
                                { icon: Truck, text: "Secure Shipping" },
                                { icon: RefreshCw, text: "Lifetime Exchange" }
                            ].map((item, i) => (
                                <div key={i} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                                    <item.icon className="w-6 h-6 mx-auto mb-2 text-gold" />
                                    <p className="text-xs text-muted-foreground leading-tight">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProductDetails;
