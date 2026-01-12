import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Newspaper, Star, Palette, Hash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

interface News {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
}

interface RasiPalan {
    id: string;
    title: string;
    content: string;
    lucky_color: string | null;
    lucky_number: string | null;
    is_active: boolean;
    created_at: string;
}

const newsSchema = z.object({
    title: z.string().trim().min(2, "Title is required"),
    content: z.string().trim().min(10, "Content must be at least 10 characters"),
});

const rasiSchema = z.object({
    title: z.string().trim().min(2, "Rasi Name is required"),
    content: z.string().trim().min(5, "Content must be provided"),
});

const AdminBlogs = () => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [rasiList, setRasiList] = useState<RasiPalan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("news");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const [newsData, setNewsData] = useState({ title: "", content: "", image_url: "", is_active: true });
    const [rasiData, setRasiData] = useState({ title: "", content: "", lucky_color: "", lucky_number: "", is_active: true });

    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [newsRes, rasiRes] = await Promise.all([
                supabase.from("news").select("*").order("created_at", { ascending: false }),
                supabase.from("rasi_palan").select("*").order("created_at", { ascending: false })
            ]);

            if (newsRes.error) throw newsRes.error;
            if (rasiRes.error) throw rasiRes.error;

            setNewsList(newsRes.data || []);
            setRasiList(rasiRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingItem(null);
        if (activeTab === "news") {
            setNewsData({ title: "", content: "", image_url: "", is_active: true });
        } else {
            setRasiData({ title: "", content: "", lucky_color: "", lucky_number: "", is_active: true });
        }
        setDialogOpen(true);
    };

    const openEditDialog = (item: any) => {
        setEditingItem(item);
        if (activeTab === "news") {
            setNewsData({
                title: item.title,
                content: item.content,
                image_url: item.image_url || "",
                is_active: String(item.is_active) === "1" || item.is_active === true,
            });
        } else {
            setRasiData({
                title: item.title,
                content: item.content,
                lucky_color: item.lucky_color || "",
                lucky_number: item.lucky_number || "",
                is_active: String(item.is_active) === "1" || item.is_active === true,
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (activeTab === "news") {
                newsSchema.parse(newsData);
                const payload = { ...newsData };

                if (editingItem) {
                    const { error } = await supabase.from("news").update(payload).eq("id", editingItem.id);
                    if (error) throw error;
                    toast({ title: "Success", description: "News updated successfully" });
                } else {
                    const { error } = await supabase.from("news").insert(payload);
                    if (error) throw error;
                    toast({ title: "Success", description: "News created successfully" });
                }
            } else {
                rasiSchema.parse(rasiData);
                const payload = { ...rasiData };

                if (editingItem) {
                    const { error } = await supabase.from("rasi_palan").update(payload).eq("id", editingItem.id);
                    if (error) throw error;
                    toast({ title: "Success", description: "Rasi Palan updated successfully" });
                } else {
                    const { error } = await supabase.from("rasi_palan").insert(payload);
                    if (error) throw error;
                    toast({ title: "Success", description: "Rasi Palan created successfully" });
                }
            }

            setDialogOpen(false);
            fetchAllData();
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                toast({
                    title: "Validation Error",
                    description: error.errors[0].message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.message || "Failed to save data",
                    variant: "destructive",
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const table = activeTab === "news" ? "news" : "rasi_palan";
            const { error } = await supabase.from(table).delete().eq("id", id);
            if (error) throw error;
            toast({ title: "Success", description: "Deleted successfully" });
            fetchAllData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleToggleActive = async (item: any) => {
        try {
            const table = activeTab === "news" ? "news" : "rasi_palan";
            const currentStatus = String(item.is_active) === "1" || item.is_active === true;
            const { error } = await supabase.from(table).update({ is_active: !currentStatus }).eq("id", item.id);
            if (error) throw error;
            fetchAllData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <AdminLayout title="Content Management">
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList className="bg-zinc-100 p-1">
                            <TabsTrigger value="news" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Newspaper className="w-4 h-4 mr-2" />
                                Today's News
                            </TabsTrigger>
                            <TabsTrigger value="rasi" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Star className="w-4 h-4 mr-2" />
                                Rasi Palan
                            </TabsTrigger>
                        </TabsList>
                        <Button onClick={openAddDialog} className="gold-gradient text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" />
                            Add {activeTab === "news" ? "News" : "Rasi Palan"}
                        </Button>
                    </div>

                    <TabsContent value="news" className="m-0">
                        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-zinc-50">
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></TableCell></TableRow>
                                    ) : newsList.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 italic text-zinc-400">No news found</TableCell></TableRow>
                                    ) : (
                                        newsList.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-zinc-50/50">
                                                <TableCell className="font-medium max-w-md truncate">{item.title}</TableCell>
                                                <TableCell className="text-sm text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Switch checked={String(item.is_active) === "1" || item.is_active === true} onCheckedChange={() => handleToggleActive(item)} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="rasi" className="m-0">
                        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-zinc-50">
                                    <TableRow>
                                        <TableHead>Rasi Name</TableHead>
                                        <TableHead>Lucky Color/No</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></TableCell></TableRow>
                                    ) : rasiList.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 italic text-zinc-400">No rasi palan entries found</TableCell></TableRow>
                                    ) : (
                                        rasiList.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-zinc-50/50">
                                                <TableCell className="font-medium">{item.title}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {item.lucky_color && <Badge variant="outline" className="text-[10px]">{item.lucky_color}</Badge>}
                                                        {item.lucky_number && <Badge variant="secondary" className="text-[10px]">{item.lucky_number}</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch checked={String(item.is_active) === "1" || item.is_active === true} onCheckedChange={() => handleToggleActive(item)} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="font-serif">
                                {editingItem ? "Edit" : "Add"} {activeTab === "news" ? "News" : "Rasi Palan"}
                            </DialogTitle>
                            <DialogDescription>
                                Fill in the details below to {editingItem ? "update the existing" : "create a new"} {activeTab === "news" ? "news article" : "daily horoscope entry"}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            {activeTab === "news" ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Title *</Label>
                                        <Input value={newsData.title} onChange={e => setNewsData({ ...newsData, title: e.target.value })} placeholder="Article title" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Image URL</Label>
                                        <Input value={newsData.image_url} onChange={e => setNewsData({ ...newsData, image_url: e.target.value })} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content *</Label>
                                        <Textarea value={newsData.content} onChange={e => setNewsData({ ...newsData, content: e.target.value })} placeholder="Full article content..." rows={6} required />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Rasi Name *</Label>
                                        <Input value={rasiData.title} onChange={e => setRasiData({ ...rasiData, title: e.target.value })} placeholder="e.g. Aries" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2"><Palette className="w-3 h-3" /> Lucky Color</Label>
                                            <Input value={rasiData.lucky_color} onChange={e => setRasiData({ ...rasiData, lucky_color: e.target.value })} placeholder="e.g. Gold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2"><Hash className="w-3 h-3" /> Lucky Number</Label>
                                            <Input value={rasiData.lucky_number} onChange={e => setRasiData({ ...rasiData, lucky_number: e.target.value })} placeholder="e.g. 7" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Daily Prediction *</Label>
                                        <Textarea value={rasiData.content} onChange={e => setRasiData({ ...rasiData, content: e.target.value })} placeholder="Enter prediction for today..." rows={5} required />
                                    </div>
                                </>
                            )}
                            <div className="flex items-center justify-between py-2">
                                <Label>Visible on website</Label>
                                <Switch checked={activeTab === 'news' ? newsData.is_active : rasiData.is_active}
                                    onCheckedChange={checked => activeTab === 'news' ? setNewsData({ ...newsData, is_active: checked }) : setRasiData({ ...rasiData, is_active: checked })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 gold-gradient text-primary-foreground" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminBlogs;
