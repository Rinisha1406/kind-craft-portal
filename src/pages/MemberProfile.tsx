import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { supabase, API_URL } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Phone, MapPin, Sparkles, LogOut, Save, Layout } from "lucide-react";
import { Link } from "react-router-dom";

const MemberProfile = () => {
    const { user, signOut } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [member, setMember] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address: ""
    });

    useEffect(() => {
        if (user) {
            fetchMemberData();
        }
    }, [user]);

    const fetchMemberData = async () => {
        try {
            // Sync with PHP/MySQL Database
            const response = await fetch(`${API_URL}/members.php`, {
                headers: {
                    'Authorization': `Bearer ${user?.id}`
                }
            });
            const result = await response.json();
            if (result.data && result.data.length > 0) {
                const data = result.data[0];
                setMember(data);
                setFormData({
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    address: data.address || ""
                });
            }
        } catch (error) {
            console.error("Error:", error);
            toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) return;
        setSaving(true);
        try {
            const response = await fetch(`${API_URL}/members.php?id=${member.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.error) throw new Error(result.error);

            toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout showFooter={false}>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-gold" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout showFooter={false}>
            <div className="min-h-screen bg-zinc-950 py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {/* Sidebar / Info */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-emerald-950/20 border border-gold/20 rounded-3xl p-8 text-center">
                                <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/30">
                                    <User className="w-12 h-12 text-gold" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-champagne mb-1">{formData.full_name}</h2>
                                <p className="text-gold/60 text-sm font-medium uppercase tracking-widest">
                                    {member?.membership_type || "Premium"} Member
                                </p>
                                <div className="mt-8 pt-8 border-t border-gold/10 space-y-4">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="w-full text-champagne/70 hover:text-gold hover:bg-gold/10 rounded-xl justify-start"
                                    >
                                        <Link to="/member/dashboard">
                                            <Layout className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => signOut()}
                                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl justify-start"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content / Edit Form */}
                        <div className="md:col-span-2">
                            <div className="bg-emerald-950/10 border border-gold/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl">
                                <h1 className="text-3xl font-serif font-bold text-champagne mb-8">Personal Information</h1>

                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-champagne/60 text-xs uppercase tracking-widest font-bold">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                                            <Input
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                className="pl-10 h-12 bg-white/5 border-gold/20 focus:border-gold/50 text-champagne rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-champagne/60 text-xs uppercase tracking-widest font-bold">Phone Connection</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                                                <Input
                                                    disabled
                                                    value={formData.phone}
                                                    className="pl-10 h-12 bg-white/5 border-emerald-500/20 text-emerald-400 rounded-xl opacity-80 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-champagne/60 text-xs uppercase tracking-widest font-bold">Personal Residency</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-4 w-4 h-4 text-gold/50" />
                                            <textarea
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full min-h-[100px] pl-10 pt-3 bg-white/5 border border-gold/20 focus:border-gold/50 text-champagne rounded-xl outline-none transition-all"
                                                placeholder="Enter your complete address..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            disabled={saving}
                                            type="submit"
                                            className="w-full md:w-auto h-12 px-10 gold-gradient text-emerald-950 font-black shadow-gold hover:scale-[1.02] transition-transform rounded-xl"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving Changes...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Profile Details
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MemberProfile;
