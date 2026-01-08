import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase, API_URL } from "@/integrations/supabase/client";
import {
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Loader2,
    Package,
    Search,
    CheckCircle2,
    XCircle,
    PlusCircle,
    Briefcase,
    ArrowLeft,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface MemberService {
    id: string;
    title: string;
    description: string;
    price: string;
    category: string;
    image_url: string;
    features: string[];
    is_active: number;
}

const ManageServices = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [services, setServices] = useState<MemberService[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<MemberService | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        features: [] as string[]
    });
    const [newFeature, setNewFeature] = useState("");

    useEffect(() => {
        if (user) {
            fetchMyServices();
        }
    }, [user]);

    const fetchMyServices = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`${API_URL}/services.php?mine=true`, {
                headers: {
                    'Authorization': `Bearer ${user.id}`
                }
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);
            setServices(result.data || []);
        } catch (error: any) {
            console.error("Error fetching services:", error);
            toast({ title: "Failed to load services", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingService
                ? `${API_URL}/services.php?id=${editingService.id}`
                : `${API_URL}/services.php`;

            const response = await fetch(url, {
                method: editingService ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            toast({
                title: editingService ? "Service Updated" : "Service Added",
                description: `Your service "${formData.title}" is now live!`,
            });

            setIsDialogOpen(false);
            setEditingService(null);
            setEditingService(null);
            setFormData({ title: "", description: "", price: "", category: "", image_url: "", features: [] });
            await fetchMyServices();
        } catch (error: any) {
            toast({
                title: "Action Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (service: MemberService) => {
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description || "",
            price: service.price || "",
            category: service.category || "",
            image_url: service.image_url || "",
            features: Array.isArray(service.features) ? service.features : []
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/services.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.id}`
                }
            });
            await fetchMyServices();
            toast({ title: "Deleted", description: "Service removed successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
        }
    };

    const toggleStatus = async (service: MemberService) => {
        try {
            const currentStatus = Number(service.is_active);
            const newStatus = currentStatus === 1 ? 0 : 1;

            await fetch(`${API_URL}/services.php?id=${service.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`
                },
                body: JSON.stringify({ is_active: newStatus })
            });
            await fetchMyServices();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const addFeature = () => {
        if (!newFeature.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, newFeature.trim()]
        }));
        setNewFeature("");
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await fetch(`${API_URL}/upload.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.id}`
                },
                body: uploadData
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            setFormData({ ...formData, image_url: result.data.publicUrl });
            toast({ title: "Image uploaded successfully" });
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <MainLayout showFooter={false}>
            <div className="min-h-screen bg-zinc-950 pt-24 pb-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-6">
                        <Link to="/member/dashboard" className="inline-flex items-center text-gold/60 hover:text-gold transition-colors font-medium text-sm group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex items-center gap-2 text-gold mb-2">
                                <Briefcase className="w-4 h-4" />
                                <span className="font-serif font-bold uppercase tracking-widest text-xs">Professional Portal</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-champagne mb-3">Manage My Services</h1>
                            <p className="text-champagne/60 text-lg max-w-2xl leading-relaxed">
                                Create and manage the services you offer to the GOLDJEWELTECH community.
                            </p>
                        </motion.div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) {
                                setEditingService(null);
                                setFormData({ title: "", description: "", price: "", category: "", image_url: "", features: [] });
                                setNewFeature("");
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button className="gold-gradient text-emerald-950 font-black h-12 px-8 rounded-xl shadow-gold hover:scale-[1.02] transition-transform shrink-0">
                                    <PlusCircle className="mr-2 w-5 h-5" /> Add New Service
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-charcoal border-gold/20 text-champagne max-w-xl max-h-[85vh] overflow-y-auto rounded-[2rem]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-serif font-bold text-gold">
                                        {editingService ? "Edit Service" : "Register a New Service"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                                    <div className="space-y-2">
                                        <Label className="text-champagne/70 font-serif">Service Title*</Label>
                                        <Input
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Premium Wedding Photography"
                                            className="bg-white/5 border-gold/20 text-champagne rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-champagne/70 font-serif">Category</Label>
                                            <Input
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                placeholder="e.g. Photography"
                                                className="bg-white/5 border-gold/20 text-champagne rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-champagne/70 font-serif">Price (Optional)</Label>
                                            <Input
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="e.g. ₹15,000 / day"
                                                className="bg-white/5 border-gold/20 text-champagne rounded-xl h-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-champagne/70 font-serif">Detailed Description</Label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe your service in detail..."
                                            className="w-full min-h-[120px] bg-white/5 border border-gold/20 rounded-xl px-4 py-3 text-champagne outline-none transition-all focus:border-gold/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-champagne/70 font-serif">Features (Bullet Points)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                                placeholder="Add a feature (e.g. 'High Resolution Images')"
                                                className="bg-white/5 border-gold/20 text-champagne rounded-xl h-11 flex-1"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addFeature();
                                                    }
                                                }}
                                            />
                                            <Button type="button" onClick={addFeature} className="bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-xl px-4">
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        {formData.features.length > 0 && (
                                            <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                                {formData.features.map((feat, i) => (
                                                    <li key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg text-sm group">
                                                        <span className="text-champagne/80 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                                                            {feat}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(i)}
                                                            className="text-white/20 hover:text-red-400 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-champagne/70 font-serif">Image</Label>
                                        <div className="flex items-center gap-4">
                                            {formData.image_url && (
                                                <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gold/20" />
                                            )}
                                            <div className="flex-1">
                                                <Input
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                    accept="image/png, image/jpeg"
                                                    disabled={uploading}
                                                    className="bg-white/5 border-gold/20 text-champagne rounded-xl h-11 file:text-gold file:font-medium hover:file:bg-gold/10"
                                                />
                                                {uploading && <p className="text-xs text-gold mt-1">Uploading...</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button disabled={submitting} type="submit" className="w-full h-12 gold-gradient text-emerald-950 font-black rounded-xl mt-4">
                                        {submitting ? <Loader2 className="animate-spin" /> : (editingService ? "Save Changes" : "List This Service")}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>


                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                            <p className="text-champagne/40">Loading your services...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-dashed border-gold/20 rounded-[2rem] py-12 text-center"
                        >
                            <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gold/30" />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-champagne mb-2">No active listings</h3>
                            <p className="text-champagne/40 max-w-sm mx-auto mb-6">
                                You haven't added any services yet. Start listing your expertise to reach the community.
                            </p>
                            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 rounded-xl px-8" onClick={() => setIsDialogOpen(true)}>
                                Get Started
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 group hover:border-gold/40 transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden hover:shadow-2xl hover:shadow-black/50"
                                >
                                    {/* Background Decor */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${Number(service.is_active) === 1 ? 'from-emerald-500/10' : 'from-red-500/10'} rounded-bl-full pointer-events-none`} />

                                    <div className="w-full md:w-32 h-32 bg-charcoal rounded-2xl border border-white/5 overflow-hidden shrink-0">
                                        <img
                                            src={service.image_url || "https://images.unsplash.com/photo-1454165833767-027eeef1526e?w=200"}
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-gold/60">{service.category || "General"}</span>
                                            <Switch
                                                checked={Number(service.is_active) === 1}
                                                onCheckedChange={() => toggleStatus(service)}
                                                className="data-[state=unchecked]:bg-zinc-700 data-[state=checked]:bg-emerald-600 border-2 border-transparent"
                                            />
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-champagne mb-1">{service.title}</h3>
                                        <p className="text-gold font-medium mb-3">{service.price || "Contact for pricing"}</p>
                                        <p className="text-champagne/40 text-sm line-clamp-2 mb-6">
                                            {service.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-white/5 hover:bg-white/10 text-champagne rounded-lg border border-white/10 h-9"
                                                onClick={() => handleEdit(service)}
                                            >
                                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg h-9"
                                                onClick={() => handleDelete(service.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </MainLayout >
    );
};

export default ManageServices;
