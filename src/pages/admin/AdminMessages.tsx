import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase, API_URL } from "@/integrations/supabase/client";
import { Loader2, Trash2, Mail, MailOpen, Search, Calendar as CalendarIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contact_messages.php`, {
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
      const response = await fetch(`${API_URL}/contact_messages.php?id=${id}`, {
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
      const response = await fetch(`${API_URL}/contact_messages.php?id=${id}`, {
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
        <div className="mb-6 flex justify-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-zinc-400 ml-1 text-right block">Filter by Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border-zinc-200 text-zinc-900 pl-10 h-10 w-full md:w-48"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="border-zinc-100 hover:bg-transparent">
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">From</TableHead>
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">Email</TableHead>
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">Phone</TableHead>
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">Subject</TableHead>
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">Message</TableHead>
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">Date</TableHead>
              <TableHead className="text-zinc-600 font-serif uppercase text-xs tracking-wider">Status</TableHead>
              <TableHead className="text-right text-zinc-600 font-serif uppercase text-xs tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" /></TableCell></TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-emerald-100/50 font-serif italic">No messages found</TableCell></TableRow>
            ) : (
              filteredMessages.map((msg) => (
                <TableRow key={msg.id} className={`${!msg.is_read ? "bg-emerald-50/50" : ""} border-zinc-100 hover:bg-emerald-50 transition-colors`}>
                  <TableCell>
                    <div className="font-medium text-zinc-900">{msg.name}</div>
                  </TableCell>
                  <TableCell className="text-zinc-500 font-mono text-xs">{msg.email}</TableCell>
                  <TableCell className="text-emerald-700 font-mono text-xs">{msg.phone || "-"}</TableCell>
                  <TableCell className="text-zinc-700">{msg.subject || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate text-zinc-600">{msg.message}</TableCell>
                  <TableCell className="text-zinc-500">{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={msg.is_read ? "bg-zinc-100 text-zinc-500 border-zinc-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                      {msg.is_read ? "Read" : "New"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRead(msg.id, msg.is_read)}
                        className="hover:bg-emerald-50 hover:text-emerald-600 text-zinc-400"
                      >
                        {msg.is_read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(msg.id)}
                        className="hover:bg-red-50 hover:text-red-600 text-zinc-400"
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
        <div className="bg-white border border-zinc-200 px-6 py-3 rounded-2xl shadow-sm">
          <span className="text-sm text-zinc-600 font-serif italic">
            Total Messages found: <span className="text-emerald-700 font-black text-lg ml-2">{filteredMessages.length}</span>
          </span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
