import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2, Eye, EyeOff, Pencil, Camera } from "lucide-react";

interface MatrimonyProfile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  occupation: string | null;
  education: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
  details: any; // JSON column
  password_hash?: string;
  is_custom_password?: boolean;
}

const AdminMatrimony = () => {
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const [editingProfile, setEditingProfile] = useState<MatrimonyProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    contact_phone: "",
    occupation: "",
    location: "",
    image_url: "",
    password: "", // New field for manual password update
    // Details fields
    dob: "",
    father_name: "",
    mother_name: "",
    caste: "",
    community: "",
    salary: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("matrimony_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matrimony profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (profile: MatrimonyProfile) => {
    setEditingProfile(profile);
    const d = profile.details || {};
    setFormData({
      full_name: profile.full_name,
      contact_phone: profile.contact_phone || "",
      occupation: profile.occupation || "",
      location: profile.location || "",
      image_url: profile.image_url || "",
      password: "", // Always reset password field
      dob: d.dob || "",
      father_name: d.father_name || "",
      mother_name: d.mother_name || "",
      caste: d.caste || "",
      community: d.community || "",
      salary: d.salary || "",
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data, error } = await supabase.storage.from('profiles').upload(`matrimony/${Date.now()}_${file.name}`, file);
      if (error) throw error;

      // In this app, data.path IS the public URL (handled by custom client)
      const publicUrl = data.path;
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Upload Failed", description: error.message || "Failed to upload image", variant: "destructive" });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    setUpdating(true);

    try {
      const details = {
        ...editingProfile.details,
        dob: formData.dob,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        caste: formData.caste,
        community: formData.community,
        salary: formData.salary,
        password_plain: formData.password || editingProfile.details?.password_plain
      };

      const updatePayload: any = {
        full_name: formData.full_name,
        contact_phone: formData.contact_phone,
        occupation: formData.occupation,
        location: formData.location,
        image_url: formData.image_url,
        details: details,
      };

      // Only send password if it has been typed in
      if (formData.password) {
        updatePayload.password = formData.password;

        // Sync with PHP/MySQL Database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch('http://localhost/kind-craft-portal/api/auth/update.php', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.id}`
            },
            body: JSON.stringify({
              password: formData.password,
              target_user_id: editingProfile.user_id
            })
          });
        }
      }

      const { error } = await supabase
        .from("matrimony_profiles")
        .update(updatePayload)
        .eq("id", editingProfile.id);

      if (error) throw error;
      toast({ title: "Success", description: "Profile updated successfully" });
      setIsDialogOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("matrimony_profiles")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: isActive
          ? "Profile hidden successfully"
          : "Profile unhidden successfully",
      });
      fetchProfiles();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) return;

    try {
      const { error } = await supabase.from("matrimony_profiles").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Profile deleted successfully" });
      fetchProfiles();
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setVisiblePasswords(newSet);
  };

  return (
    <AdminLayout title="Matrimony Profiles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Manage and view all registered matrimony profiles.</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 border-gold/20 text-emerald-100 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gold font-serif">Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Full Name</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Mobile Number</Label>
                    <Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Occupation</Label>
                    <Input value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Location</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Date of Birth</Label>
                    <Input value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Profile Image</Label>
                    <div className="flex items-center gap-4">
                      {formData.image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gold/20 shrink-0">
                          <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-flex items-center justify-center gap-2 bg-black/40 border border-gold/20 hover:bg-gold/10 text-gold px-4 py-2 rounded-lg transition-colors w-full h-10"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{formData.image_url ? "Change Photo" : "Upload Photo"}</span>
                          <Input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageUpload}
                          />
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">New Password (Optional)</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-black/40 border-gold/20 text-white"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Salary</Label>
                    <Input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Caste</Label>
                    <Input value={formData.caste} onChange={(e) => setFormData({ ...formData, caste: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Community</Label>
                    <Input value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Father's Name</Label>
                    <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-100/70">Mother's Name</Label>
                    <Input value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="bg-black/40 border-gold/20 text-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:text-gold hover:bg-gold/10">Cancel</Button>
                  <Button type="submit" disabled={updating} className="gold-gradient text-emerald-950 font-bold">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Profile"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border border-gold/20 overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-950 to-black text-champagne">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/40 border-b border-gold/20">
                <TableRow className="hover:bg-transparent border-gold/10">
                  <TableHead className="text-gold font-serif py-6 whitespace-nowrap">Image</TableHead>
                  <TableHead className="text-gold font-serif py-6 whitespace-nowrap">Name</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">DOB</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Mobile Number</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Father's Name</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Mother's Name</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Caste</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Community</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Occupation</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Salary</TableHead>
                  <TableHead className="text-gold font-serif whitespace-nowrap">Password</TableHead>
                  <TableHead className="text-right text-gold font-serif whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-transparent border-gold/10">
                    <TableCell colSpan={12} className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gold" />
                    </TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow className="hover:bg-transparent border-gold/10">
                    <TableCell colSpan={12} className="text-center py-12 text-zinc-500 font-serif italic">
                      No matrimony profiles found
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-emerald-900/20 border-b border-gold/10 transition-colors group">
                      <TableCell className="py-4">
                        <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden border border-gold/10">
                          {profile.image_url ? (
                            <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-100/30">✦</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white group-hover:text-gold transition-colors whitespace-nowrap">{profile.full_name}</TableCell>
                      <TableCell className="text-emerald-100/70 whitespace-nowrap">{profile.details?.dob || "-"}</TableCell>
                      <TableCell className="text-emerald-100/70 whitespace-nowrap">{profile.contact_phone || "-"}</TableCell>
                      <TableCell className="text-emerald-100/60 whitespace-nowrap">{profile.details?.father_name || "-"}</TableCell>
                      <TableCell className="text-emerald-100/60 whitespace-nowrap">{profile.details?.mother_name || "-"}</TableCell>
                      <TableCell className="text-emerald-100/60 whitespace-nowrap">{profile.details?.caste || "-"}</TableCell>
                      <TableCell className="text-emerald-100/60 whitespace-nowrap">{profile.details?.community || "-"}</TableCell>
                      <TableCell className="text-emerald-100/80 whitespace-nowrap">{profile.occupation || "-"}</TableCell>
                      <TableCell className="text-gold/90 whitespace-nowrap">{profile.details?.salary || "-"}</TableCell>
                      <TableCell className="text-emerald-100/40 font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[8ch]">
                            {visiblePasswords.has(profile.id)
                              ? (profile.details?.password_plain
                                ? <span className="text-gold font-mono">{profile.details.password_plain}</span>
                                : (profile.is_custom_password
                                  ? <span className="text-zinc-500 italic text-xs">Legacy (Hidden)</span>
                                  : (profile.details?.dob || "N/A")))
                              : "••••••"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-gold/10 hover:text-gold text-zinc-400"
                            onClick={() => togglePasswordVisibility(profile.id)}
                            title={visiblePasswords.has(profile.id) ? "Hide Password" : "Show Password"}
                          >
                            {visiblePasswords.has(profile.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(profile.id, profile.is_active)}
                            title={profile.is_active ? "Hide Profile" : "Unhide Profile"}
                            className="hover:bg-gold/10 hover:text-gold text-zinc-400"
                          >
                            {profile.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(profile)}
                            title="Edit"
                            className="hover:bg-gold/10 hover:text-gold text-zinc-400"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(profile.id)}
                            title="Delete"
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
      </div>
    </AdminLayout>
  );
};

export default AdminMatrimony;
