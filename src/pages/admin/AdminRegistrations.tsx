import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Trash2 } from "lucide-react";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  registration_type: string;
  status: string | null;
  created_at: string;
}

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: `Registration ${status}` });
      fetchRegistrations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    try {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Registration deleted" });
      fetchRegistrations();
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Registrations">
      <div className="bg-gradient-to-br from-emerald-950 to-black rounded-xl border border-gold/20 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold font-serif">Name</TableHead>
              <TableHead className="text-gold font-serif">Email</TableHead>
              <TableHead className="text-gold font-serif">Phone</TableHead>
              <TableHead className="text-gold font-serif">Type</TableHead>
              <TableHead className="text-gold font-serif">Date</TableHead>
              <TableHead className="text-gold font-serif">Status</TableHead>
              <TableHead className="text-right text-gold font-serif">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></TableCell></TableRow>
            ) : registrations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-emerald-100/50 font-serif italic">No registrations</TableCell></TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id} className="border-gold/10 hover:bg-emerald-900/20 transition-colors">
                  <TableCell className="font-medium text-emerald-100">{reg.full_name}</TableCell>
                  <TableCell className="text-emerald-100/70">{reg.email}</TableCell>
                  <TableCell className="text-emerald-100/70">{reg.phone || "-"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize border-gold/30 text-gold bg-gold/5">{reg.registration_type}</Badge></TableCell>
                  <TableCell className="text-emerald-100/60">{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={`border ${reg.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : reg.status === "rejected"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                      {reg.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(reg.id, "approved")}
                        className="hover:bg-emerald-500/10 text-emerald-100/50 hover:text-emerald-400"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateStatus(reg.id, "rejected")}
                        className="hover:bg-red-500/10 text-emerald-100/50 hover:text-red-400"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reg.id)}
                        className="hover:bg-red-500/10 text-emerald-100/50 hover:text-red-400"
                        title="Delete"
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
    </AdminLayout>
  );
};

export default AdminRegistrations;
