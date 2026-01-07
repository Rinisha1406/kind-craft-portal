import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Mail, MailOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";

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
  const [filterDate, setFilterDate] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost/kind-craft-portal/api/contact_messages.php', {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setMessages(result.data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to fetch messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch(`http://localhost/kind-craft-portal/api/contact_messages.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({ is_read: !isRead })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      fetchMessages();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const response = await fetch(`http://localhost/kind-craft-portal/api/contact_messages.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      toast({ title: "Deleted" });
      fetchMessages();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (!filterDate) return true;
    const msgDate = new Date(msg.created_at).toISOString().split('T')[0];
    return msgDate === filterDate;
  });

  return (
    <AdminLayout title="Messages">
      <div className="mb-6 flex justify-end">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-emerald-100/50 ml-1 text-right block">Filter by Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-emerald-950/20 border-gold/20 text-emerald-100 pl-10 h-10 w-full md:w-48 [color-scheme:dark]"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/50 hover:text-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-950 to-black rounded-xl border border-gold/20 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold font-serif">From</TableHead>
              <TableHead className="text-gold font-serif">Email</TableHead>
              <TableHead className="text-gold font-serif">Phone</TableHead>
              <TableHead className="text-gold font-serif">Subject</TableHead>
              <TableHead className="text-gold font-serif">Message</TableHead>
              <TableHead className="text-gold font-serif">Date</TableHead>
              <TableHead className="text-gold font-serif">Status</TableHead>
              <TableHead className="text-right text-gold font-serif">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></TableCell></TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-emerald-100/50 font-serif italic">No messages found</TableCell></TableRow>
            ) : (
              filteredMessages.map((msg) => (
                <TableRow key={msg.id} className={`${!msg.is_read ? "bg-emerald-900/10" : ""} border-gold/10 hover:bg-emerald-900/20 transition-colors`}>
                  <TableCell>
                    <div className="font-medium text-emerald-100">{msg.name}</div>
                  </TableCell>
                  <TableCell className="text-emerald-100/60 font-mono text-sm">{msg.email}</TableCell>
                  <TableCell className="text-amber-400/80 font-mono text-xs">{msg.phone || "-"}</TableCell>
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

      <div className="mt-6 flex justify-end">
        <div className="bg-emerald-950/20 border border-gold/10 px-6 py-3 rounded-2xl backdrop-blur-sm shadow-xl">
          <span className="text-sm text-emerald-100/60 font-serif italic">
            Total Messages found: <span className="text-gold font-black text-lg ml-2">{filteredMessages.length}</span>
          </span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
