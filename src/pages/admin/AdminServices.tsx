import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Link as LinkIcon, Eye, EyeOff, Check, X, ImageIcon, Loader2 } from "lucide-react";

interface Service {
    id: string;
    title: string;
    description: string;
    image_url: string;
    features: string[];
    is_active: boolean;
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({
        title: "",
        description: "",
        image_url: "",
        features: [],
        is_active: true,
    });
    const [featureInput, setFeatureInput] = useState("");
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
            if (error) throw error;
            setServices(data || []);
        } catch (error: any) {
            toast({
                title: "Error fetching services",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({ ...service });
        } else {
            setEditingService(null);
            setFormData({
                title: "",
                description: "",
                image_url: "",
                features: [],
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.title) return toast({ title: "Title is required", variant: "destructive" });

            if (editingService) {
                const { error } = await supabase
                    .from("services")
                    .update({
                        title: formData.title,
                        description: formData.description,
                        image_url: formData.image_url,
                        features: formData.features,
                        is_active: formData.is_active
                    })
                    .eq("id", editingService.id);

                if (error) throw error;
                toast({ title: "Service updated successfully" });
            } else {
                const { error } = await supabase.from("services").insert([{
                    title: formData.title,
                    description: formData.description,
                    image_url: formData.image_url,
                    features: formData.features,
                    is_active: true
                }]);

                if (error) throw error;
                toast({ title: "Service created successfully" });
            }

            setIsDialogOpen(false);
            fetchServices();
        } catch (error: any) {
            console.error("Save error:", error);
            toast({
                title: "Error saving service",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            const { error } = await supabase.from("services").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Service deleted" });
            fetchServices();
        } catch (error: any) {
            toast({ title: "Error deleting", description: error.message, variant: "destructive" });
        }
    };

    const handleToggleActive = async (service: Service) => {
        try {
            const { error } = await supabase
                .from("services")
                .update({ is_active: !service.is_active })
                .eq("id", service.id);
            if (error) throw error;
            fetchServices();
        } catch (error: any) {
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        }
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput] }));
        setFeatureInput("");
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('service-images') // Ensure this bucket exists or use 'product-images' if needed
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('service-images').getPublicUrl(filePath);
            setFormData({ ...formData, image_url: data.publicUrl });
            toast({ title: "Image uploaded successfully" });
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <AdminLayout title="Services">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-900 font-serif">Manage Services</h1>
                    <p className="text-emerald-700 mt-2">Add or edit services displayed on the website.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
            </div>

            <div className="rounded-xl border border-gold/20 overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-950 to-black text-champagne">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-black/40 border-b border-gold/20">
                            <TableRow className="hover:bg-transparent border-gold/10">
                                <TableHead className="text-gold font-serif py-6 whitespace-nowrap">Image</TableHead>
                                <TableHead className="text-gold font-serif py-6 whitespace-nowrap">Title</TableHead>
                                <TableHead className="text-gold font-serif whitespace-nowrap">Description</TableHead>
                                <TableHead className="text-gold font-serif whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-right text-gold font-serif whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="hover:bg-transparent border-gold/10">
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" />
                                    </TableCell>
                                </TableRow>
                            ) : services.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-gold/10">
                                    <TableCell colSpan={5} className="text-center py-12 text-zinc-500 font-serif italic">No services found.</TableCell>
                                </TableRow>
                            ) : (
                                services.map((service) => (
                                    <TableRow key={service.id} className="hover:bg-emerald-900/20 border-b border-gold/10 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden border border-gold/10">
                                                {service.image_url ? (
                                                    <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-emerald-100/30">✦</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-white group-hover:text-gold transition-colors whitespace-nowrap">{service.title}</TableCell>
                                        <TableCell className="max-w-xs truncate text-emerald-100/70" title={service.description}>{service.description}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleActive(service)}
                                                className={`h-8 px-3 rounded-full border ${service.is_active
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20"
                                                    }`}
                                            >
                                                {service.is_active ? "Active" : "Inactive"}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(service)}
                                                    className="hover:bg-gold/10 hover:text-gold text-zinc-400"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(service.id)}
                                                    className="hover:bg-red-500/10 hover:text-red-400 text-zinc-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif text-emerald-900">
                            {editingService ? "Edit Service" : "Add New Service"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Service Name" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the service" />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Service Image</Label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                                    )}
                                    <div className="flex-1">
                                        <Input type="file" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                                        {uploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-2">
                                <Label>Features (Bullet Points)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        placeholder="Add a feature point"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    />
                                    <Button type="button" onClick={addFeature} variant="outline"><Plus className="w-4 h-4" /></Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.features?.map((feat, idx) => (
                                        <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            {feat} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeFeature(idx)} />
                                        </span>
                                    ))}
                                </div>
                            </div>


                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={uploading}>
                            {editingService ? "Update Service" : "Create Service"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminServices;
