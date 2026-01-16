import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Image as ImageIcon, Youtube, ExternalLink } from "lucide-react";

interface GalleryItem {
    id: string;
    type: "image" | "youtube";
    url: string;
    title: string | null;
    is_active: boolean | number;
    created_at: string;
}

const AdminGallery = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [formData, setFormData] = useState({
        type: "image" as "image" | "youtube",
        url: "",
        title: "",
        is_active: true,
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const { data, error } = await supabase.from("gallery").select("*");
            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            toast.error("Error fetching gallery: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage.from("uploads").upload(filePath, file);
            if (error) throw error;

            setFormData({ ...formData, url: data.path });
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            toast.error("Error uploading image: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url) {
            toast.error("URL or Image is required");
            return;
        }

        try {
            if (editingItem) {
                const { error } = await supabase
                    .from("gallery")
                    .update({
                        type: formData.type,
                        url: formData.url,
                        title: formData.title || null,
                        is_active: formData.is_active,
                    })
                    .eq("id", editingItem.id);
                if (error) throw error;
                toast.success("Gallery item updated");
            } else {
                const { error } = await supabase.from("gallery").insert([
                    {
                        type: formData.type,
                        url: formData.url,
                        title: formData.title || null,
                        is_active: formData.is_active,
                    },
                ]);
                if (error) throw error;
                toast.success("Gallery item added");
            }
            setDialogOpen(false);
            fetchGallery();
            resetForm();
        } catch (error: any) {
            toast.error("Error saving item: " + error.message);
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const { error } = await supabase.from("gallery").delete().eq("id", id);
            if (error) throw error;
            toast.success("Item deleted");
            fetchGallery();
        } catch (error: any) {
            toast.error("Error deleting item: " + error.message);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({ type: "image", url: "", title: "", is_active: true });
    };

    const openEditDialog = (item: GalleryItem) => {
        setEditingItem(item);
        setFormData({
            type: item.type,
            url: item.url,
            title: item.title || "",
            is_active: !!item.is_active,
        });
        setDialogOpen(true);
    };

    return (
        <AdminLayout title="Gallery Management">
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Gallery Items</h2>
                        <p className="text-muted-foreground">Manage your images and YouTube videos</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gold hover:bg-gold/90 text-primary-foreground">
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Gallery Item" : "Add Gallery Item"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Media Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val: "image" | "youtube") => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="youtube">YouTube Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Title (Optional)</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter title"
                                    />
                                </div>

                                {formData.type === "image" ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Upload Image</Label>
                                        <Input id="file" type="file" onChange={handleFileUpload} accept="image/*" />
                                        {formData.url && (
                                            <div className="mt-2 text-xs text-muted-foreground break-all">
                                                Current Path: {formData.url}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="url">YouTube URL</Label>
                                        <Input
                                            id="url"
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>

                                <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-primary-foreground" disabled={uploading}>
                                    {editingItem ? "Update Item" : "Add Item"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Preview</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">Loading gallery...</TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">No items found.</TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.type === "image" ? (
                                                <Badge variant="outline" className="flex w-fit items-center gap-1">
                                                    <ImageIcon className="h-3 w-3" /> Image
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="flex w-fit items-center gap-1">
                                                    <Youtube className="h-3 w-3" /> Video
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                                                {item.type === "image" ? (
                                                    <img
                                                        src={supabase.storage.from("uploads").getPublicUrl(item.url).data.publicUrl}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://img.youtube.com/vi/${item.url.split('v=')[1]?.split('&')[0] || item.url.split('/').pop()}/default.jpg`}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.title || "-"}</TableCell>
                                        <TableCell>
                                            <Badge className={item.is_active ? "bg-green-500" : "bg-zinc-500"}>
                                                {item.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

const Badge = ({ children, className, variant = "default" }: any) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className} ${variant === "outline" ? "border border-border" : ""}`}>
        {children}
    </span>
);

export default AdminGallery;
