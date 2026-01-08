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
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react";

interface Service {
    id: string;
    user_id: string | null;
    title: string;
    description: string;
    price: string;
    category: string;
    image_url: string;
    features: string[];
    is_active: number; // API uses number (1/0)
    provider_name?: string;
    created_at?: string;
}

const AdminServices = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({
        title: "",
        description: "",
        image_url: "",
        features: [],
        is_active: 1,
        price: "",
        category: ""
    });
    const [featureInput, setFeatureInput] = useState("");
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchServices();
        }
    }, [user]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost/kind-craft-portal/api/services.php?admin=true`, {
                headers: {
                    'Authorization': `Bearer ${user?.id}`
                }
            });
            const result = await response.json();

            if (result.error) throw new Error(result.error);

            setServices(result.data || []);
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
            setFormData({
                ...service,
                features: Array.isArray(service.features) ? service.features : []
            });
        } else {
            setEditingService(null);
            setFormData({
                title: "",
                description: "",
                image_url: "",
                features: [],
                is_active: 1,
                price: "",
                category: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            setSubmitting(true);
            if (!formData.title) return toast({ title: "Title is required", variant: "destructive" });

            const url = editingService
                ? `http://localhost/kind-craft-portal/api/services.php?id=${editingService.id}`
                : `http://localhost/kind-craft-portal/api/services.php`;

            const method = editingService ? 'PUT' : 'POST';

            // Ensure user_id is passed if creating and not editing (though API handles provider)
            // For admin creating platform services, user_id should be null or special handling?
            // API: if admin, provider_id = input['user_id'] ?? null. So null is platform.

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            toast({ title: editingService ? "Service updated" : "Service created" });
            setIsDialogOpen(false);
            fetchServices();
        } catch (error: any) {
            console.error("Save error:", error);
            toast({
                title: "Error saving service",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            const response = await fetch(`http://localhost/kind-craft-portal/api/services.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.id}`
                }
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);

            toast({ title: "Service deleted" });
            fetchServices();
        } catch (error: any) {
            toast({ title: "Error deleting", description: error.message, variant: "destructive" });
        }
    };

    const handleToggleActive = async (service: Service) => {
        try {
            const newStatus = service.is_active ? 0 : 1;
            const response = await fetch(`http://localhost/kind-craft-portal/api/services.php?id=${service.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`
                },
                body: JSON.stringify({ is_active: newStatus })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            fetchServices();
        } catch (error: any) {
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        }
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...(prev.features || []), featureInput]
        }));
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
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await fetch('http://localhost/kind-craft-portal/api/upload.php', {
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
                                <TableHead className="text-gold font-serif py-6 whitespace-nowrap">Date Added</TableHead>
                                <TableHead className="text-gold font-serif whitespace-nowrap">Provider</TableHead>
                                <TableHead className="text-gold font-serif whitespace-nowrap text-center">Price</TableHead>
                                <TableHead className="text-gold font-serif whitespace-nowrap text-center">Visible</TableHead>
                                <TableHead className="text-right text-gold font-serif whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow className="hover:bg-transparent border-gold/10">
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" />
                                    </TableCell>
                                </TableRow>
                            ) : services.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-gold/10">
                                    <TableCell colSpan={6} className="text-center py-12 text-zinc-500 font-serif italic">No services found.</TableCell>
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
                                        <TableCell className="text-zinc-400 whitespace-nowrap text-sm">
                                            {service.created_at ? new Date(service.created_at).toLocaleDateString() : "-"}
                                        </TableCell>
                                        <TableCell className="text-emerald-100/70 whitespace-nowrap">
                                            {service.provider_name || "Platform"}
                                        </TableCell>
                                        <TableCell className="text-center text-blue-300 font-bold">{service.price || "-"}</TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={!!service.is_active}
                                                onCheckedChange={() => handleToggleActive(service)}
                                                className="data-[state=unchecked]:bg-zinc-700 data-[state=checked]:bg-emerald-600 border-2 border-transparent"
                                            />
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


                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price</Label>
                                    <Input value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. ₹5,000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Consulting" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={submitting || uploading}>
                            {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            {editingService ? "Update Service" : "Create Service"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminServices;
