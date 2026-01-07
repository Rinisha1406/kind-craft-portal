import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

type ProductCategory = "silver" | "gold" | "diamond" | "platinum" | "gemstone";

interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string | null;
  image_url: string | null;
  images?: string[];
  is_active: boolean;
  created_at: string;
}

const categories: ProductCategory[] = ["silver", "gold", "diamond", "platinum", "gemstone"];

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  price: z.number().positive("Price must be positive"),
  category: z.enum(["silver", "gold", "diamond", "platinum", "gemstone"]),
  description: z.string().max(500).optional(),
  is_active: z.boolean(),
});

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "gold" as ProductCategory,
    description: "",
    is_active: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", category: "gold", description: "", is_active: true });
    setImageFiles([]);
    setExistingImages([]);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description || "",
      is_active: String(product.is_active) === "1" || product.is_active === true,
    });
    // Use images array if available, otherwise fallback to image_url or empty
    const imgs = product.images && Array.isArray(product.images) ? product.images : (product.image_url ? [product.image_url] : []);
    setExistingImages(imgs);
    setImageFiles([]);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = productSchema.parse({
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description || undefined,
        is_active: formData.is_active,
      });

      let finalImages = [...existingImages];

      // Upload new images
      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(uploadData.path);

        finalImages.push(publicUrl);
      }

      // Main image is the first one
      const mainImageUrl = finalImages.length > 0 ? finalImages[0] : null;

      const payload = {
        name: validated.name,
        price: validated.price,
        category: validated.category,
        description: validated.description || null,
        image_url: mainImageUrl, // Backward compatibility
        images: finalImages,
        is_active: validated.is_active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase.from("products").insert(payload);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Error saving product:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save product",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const currentStatus = String(product.is_active) === "1" || product.is_active === true;
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", product.id);

      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Manage your product catalog</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gold-gradient text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v: ProductCategory) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active Status</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Product Images</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />

                  {/* Image Previews */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, true)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {imageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, false)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">New</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">First image will be the primary display image.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1 gold-gradient text-primary-foreground">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-gradient-to-br from-emerald-950 to-black rounded-xl border border-gold/20 overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-gold/10 hover:bg-transparent">
                <TableHead className="text-gold font-serif">Image</TableHead>
                <TableHead className="text-gold font-serif">Name</TableHead>
                <TableHead className="text-gold font-serif">Price</TableHead>
                <TableHead className="text-gold font-serif">Category</TableHead>
                <TableHead className="text-gold font-serif">Visible</TableHead>
                <TableHead className="text-right text-gold font-serif">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-emerald-100/50 font-serif italic">
                    No products found. Add your first product!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="border-gold/10 hover:bg-emerald-900/20 transition-colors">
                    <TableCell>
                      <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden border border-gold/10">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-100/30">✦</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-100">{product.name}</TableCell>
                    <TableCell className="text-gold font-medium">₹{product.price.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-gold/30 text-gold bg-gold/5">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={String(product.is_active) === "1" || product.is_active === true}
                        onCheckedChange={() => handleToggleActive(product)}
                        className="data-[state=unchecked]:bg-zinc-700 data-[state=checked]:bg-emerald-600 border-2 border-transparent"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          className="hover:bg-gold/10 hover:text-gold text-emerald-100/50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="hover:bg-red-500/10 hover:text-red-400 text-emerald-100/50"
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
    </AdminLayout>
  );
};

export default AdminProducts;
