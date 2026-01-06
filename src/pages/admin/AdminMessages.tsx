import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Mail, MailOpen } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    await supabase.from("contact_messages").update({ is_read: !isRead }).eq("id", id);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchMessages();
  };

  return (
    <AdminLayout title="Messages">
      <div className="bg-gradient-to-br from-emerald-950 to-black rounded-xl border border-gold/20 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold font-serif">From</TableHead>
              <TableHead className="text-gold font-serif">Subject</TableHead>
              <TableHead className="text-gold font-serif">Message</TableHead>
              <TableHead className="text-gold font-serif">Date</TableHead>
              <TableHead className="text-gold font-serif">Status</TableHead>
              <TableHead className="text-right text-gold font-serif">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></TableCell></TableRow>
            ) : messages.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-emerald-100/50 font-serif italic">No messages</TableCell></TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.id} className={`${!msg.is_read ? "bg-emerald-900/10" : ""} border-gold/10 hover:bg-emerald-900/20 transition-colors`}>
                  <TableCell>
                    <div className="font-medium text-emerald-100">{msg.name}</div>
                    <div className="text-sm text-emerald-100/60">{msg.email}</div>
                  </TableCell>
                  <TableCell className="text-emerald-100/80">{msg.subject || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate text-emerald-100/70">{msg.message}</TableCell>
                  <TableCell className="text-emerald-100/60">{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={msg.is_read ? "bg-emerald-900/20 text-emerald-100/50 border-emerald-500/10" : "bg-gold/20 text-gold border-gold/30"}>
                      {msg.is_read ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRead(msg.id, msg.is_read)}
                        className="hover:bg-gold/10 hover:text-gold text-emerald-100/50"
                      >
                        {msg.is_read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(msg.id)}
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
    </AdminLayout>
  );
};

export default AdminMessages;
