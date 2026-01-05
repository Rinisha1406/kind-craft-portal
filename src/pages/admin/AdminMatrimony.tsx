import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Eye, EyeOff } from "lucide-react";

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
  is_active: boolean;
  created_at: string;
}

const AdminMatrimony = () => {
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("matrimony_profiles")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: `Profile ${isActive ? "hidden" : "published"} successfully`,
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

  return (
    <AdminLayout title="Matrimony Profiles">
      <div className="space-y-6">
        <p className="text-muted-foreground">Manage matrimony profiles</p>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No matrimony profiles found
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.age}</TableCell>
                    <TableCell className="capitalize">{profile.gender}</TableCell>
                    <TableCell>{profile.occupation || "-"}</TableCell>
                    <TableCell>{profile.location || "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {profile.contact_email && <div>{profile.contact_email}</div>}
                        {profile.contact_phone && <div className="text-muted-foreground">{profile.contact_phone}</div>}
                        {!profile.contact_email && !profile.contact_phone && "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={profile.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {profile.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(profile.id, profile.is_active)}
                          title={profile.is_active ? "Hide profile" : "Show profile"}
                        >
                          {profile.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
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

export default AdminMatrimony;
