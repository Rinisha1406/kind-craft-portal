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
import { Loader2, Trash2, Pencil } from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  membership_type: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    membership_type: "standard",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (member: Member) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone || "",
      membership_type: member.membership_type || "standard",
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("members")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          membership_type: formData.membership_type,
        })
        .eq("id", editingMember.id);

      if (error) throw error;
      toast({ title: "Success", description: "Member updated successfully" });
      setIsDialogOpen(false);
      fetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);
      toast({ title: "Error", description: "Failed to update member", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("members")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Member ${isActive ? "deactivated" : "activated"} successfully`,
      });
      fetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Member deleted successfully" });
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Members">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Manage registered members</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-lg bg-zinc-950 border-gold/20 text-emerald-100">
              <DialogHeader>
                <DialogTitle className="text-gold font-serif">Edit Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-emerald-100/70">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-black/40 border-gold/20 focus:border-gold/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-emerald-100/70">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black/40 border-gold/20 focus:border-gold/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-emerald-100/70">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-black/40 border-gold/20 focus:border-gold/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membership" className="text-emerald-100/70">Membership Type</Label>
                  <Input
                    id="membership"
                    value={formData.membership_type}
                    onChange={(e) => setFormData({ ...formData, membership_type: e.target.value })}
                    className="bg-black/40 border-gold/20 focus:border-gold/50 text-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:text-gold hover:bg-gold/10">Cancel</Button>
                  <Button type="submit" disabled={updating} className="gold-gradient text-emerald-950 font-bold">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Member"}
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
                <TableHead className="text-gold font-serif">Name</TableHead>
                <TableHead className="text-gold font-serif">Email</TableHead>
                <TableHead className="text-gold font-serif">Phone</TableHead>
                <TableHead className="text-gold font-serif">Membership</TableHead>
                <TableHead className="text-gold font-serif">Joined</TableHead>
                <TableHead className="text-gold font-serif">Status</TableHead>
                <TableHead className="text-right text-gold font-serif">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-emerald-100/50 font-serif italic">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} className="border-gold/10 hover:bg-emerald-900/20 transition-colors">
                    <TableCell className="font-medium text-emerald-100">{member.full_name}</TableCell>
                    <TableCell className="text-emerald-100/70">{member.email}</TableCell>
                    <TableCell className="text-emerald-100/70">{member.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-gold/30 text-gold bg-gold/5">
                        {member.membership_type || "Standard"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-emerald-100/60">
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border ${member.is_active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        onClick={() => toggleActive(member.id, member.is_active)}
                        style={{ cursor: "pointer" }}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(member)}
                          className="hover:bg-gold/10 hover:text-gold text-emerald-100/50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.id)}
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

export default AdminMembers;
