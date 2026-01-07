
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Lock, User, Save, LogOut, Heart, MessageCircle, Settings, Shield, Bell, MapPin, Briefcase, Edit2, X, Star, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MatrimonyProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "",
        contact_phone: "",
        occupation: "",
        location: "",
        dob: "",
        father_name: "",
        mother_name: "",
        caste: "",
        community: "",
        salary: ""
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [matches, setMatches] = useState<any[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/matrimony';
                return;
            }

            const { data, error } = await supabase
                .from('matrimony_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
            setImage(data.image_url);

            // Initialize Form Data
            setFormData({
                full_name: data.full_name || "",
                contact_phone: data.contact_phone || data.phone || "",
                occupation: data.occupation || "",
                location: data.location || "",
                dob: data.details?.dob || "",
                father_name: data.details?.father_name || "",
                mother_name: data.details?.mother_name || "",
                caste: data.details?.caste || "",
                community: data.details?.community || "",
                salary: data.details?.salary || ""
            });

            // Fetch Matches (Opposite Gender)
            if (data.gender) {
                try {
                    const response = await fetch(`http://localhost/kind-craft-portal/api/matches.php?gender=${data.gender}&exclude_id=${data.id}`);
                    const matchesData = await response.json();

                    if (Array.isArray(matchesData)) {
                        setMatches(matchesData);
                    } else {
                        console.error("Error fetching matches:", matchesData);
                    }
                } catch (err) {
                    console.error("Error fetching matches:", err);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'matrimony');

        try {
            // 1. Upload Image
            const uploadResponse = await fetch('http://localhost/kind-craft-portal/api/upload.php', {
                method: 'POST',
                body: formData
            });
            const uploadResult = await uploadResponse.json();

            if (uploadResult.error) throw new Error(uploadResult.error);

            const publicUrl = uploadResult.data.publicUrl; // e.g. /uploads/filename.jpg

            // Adjust URL to be absolute if needed, or keep relative if <img src> handles it.
            // Assuming localhost root for now.
            const fullImageUrl = `http://localhost/kind-craft-portal${publicUrl}`;

            // 2. Update Profile in DB
            if (profile?.id) {
                const updateResponse = await fetch(`http://localhost/kind-craft-portal/api/matrimony_profiles.php?id=${profile.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: fullImageUrl })
                });

                if (!updateResponse.ok) throw new Error('Failed to update profile image');
            }

            setImage(fullImageUrl);
            toast({ title: "Success", description: "Profile photo updated!" });

        } catch (error: any) {
            console.error("Upload error:", error);
            toast({ title: "Upload Failed", description: error.message || "Unknown error", variant: "destructive" });
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // Construct the details JSON object
            const details = {
                ...profile.details, // Keep existing details we might not be editing
                dob: formData.dob,
                father_name: formData.father_name,
                mother_name: formData.mother_name,
                caste: formData.caste,
                community: formData.community,
                salary: formData.salary
            };

            const { error } = await supabase
                .from('matrimony_profiles')
                .update({
                    full_name: formData.full_name,
                    contact_phone: formData.contact_phone,
                    occupation: formData.occupation,
                    location: formData.location,
                    details: details
                })
                .eq('id', profile.id);

            if (error) throw error;

            toast({ title: "Success", description: "Profile updated successfully!" });
            setIsEditing(false);
            fetchProfile(); // Refresh data
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
            return;
        }

        try {
            // 1. Update Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({ password: passwordData.new });
            if (authError) throw authError;

            // 2. Sync with PHP/MySQL Database
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const response = await fetch('http://localhost/kind-craft-portal/api/auth/update.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.id}`
                    },
                    body: JSON.stringify({ password: passwordData.new })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to sync password with database');
                }

                // 3. Update Supabase Profile Details JSON
                await supabase
                    .from('matrimony_profiles')
                    .update({
                        details: {
                            ...profile?.details,
                            password_plain: passwordData.new
                        }
                    })
                    .eq('user_id', user.id);
            }

            toast({ title: "Success", description: "Password updated successfully across all systems!" });
            setPasswordData({ current: "", new: "", confirm: "" });
        } catch (error: any) {
            console.error("Password change error:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleExpressInterest = async (matchId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('matrimony_interests')
                .insert({
                    sender_id: user.id,
                    receiver_id: matchId,
                    status: 'pending'
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast({ title: "Already Sent", description: "You have already expressed interest in this profile." });
                } else {
                    throw error;
                }
            } else {
                toast({ title: "Interest Sent!", description: "We've notified them about your interest." });
            }
        } catch (error: any) {
            console.error("Interest error:", error);
            toast({ title: "Error", description: "Could not send interest. Please try again.", variant: "destructive" });
        }
    };

    const handleDismissMatch = (matchId: string) => {
        setMatches(prev => prev.filter(m => m.id !== matchId));
        setViewDialogOpen(false);
        toast({ title: "Match Dismissed", description: "Profile removed from your recommendations." });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/matrimony';
    };

    if (loading) return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
    );

    return (
        <MainLayout showFooter={true}>
            <div className="min-h-screen bg-white text-zinc-900 relative font-sans selection:bg-emerald-500/10">
                {/* Animated Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-emerald-500/5 blur-[150px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            x: [0, -60, 0],
                            y: [0, 40, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-amber-400/5 blur-[180px] rounded-full"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 py-10 mb-8">

                    {/* Profile Header Block */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col md:flex-row gap-8 items-center md:items-end pb-12 border-b border-zinc-200/60"
                    >
                        {/* Avatar Container with Neon Flow */}
                        <div className="relative group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-48 h-48 rounded-[2rem] overflow-hidden border-2 border-zinc-200 shadow-3xl bg-zinc-50 backdrop-blur-3xl relative p-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-full h-full rounded-[1.8rem] overflow-hidden relative z-10">
                                    {image ? (
                                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-100/50">
                                            <User className="w-20 h-20 text-zinc-700" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            <label className="absolute inset-0 rounded-[2rem] flex items-center justify-center bg-emerald-600/20 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 text-white backdrop-blur-[2px] z-20">
                                <Camera className="w-8 h-8 opacity-80" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-emerald-600 to-amber-500 text-white p-2.5 rounded-2xl border-2 border-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] z-30"
                            >
                                <Shield className="w-5 h-5 fill-current" />
                            </motion.div>
                        </div>

                        {/* Basic Info - Dashboard Style */}
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3"
                                >
                                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                                        Premium Access
                                    </span>
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-7xl font-sans font-black text-zinc-900 tracking-tighter leading-[0.9]"
                                >
                                    {profile?.full_name || "Profile Name"}
                                </motion.h1>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap items-center justify-center md:justify-start gap-10"
                            >
                                <div className="flex items-center gap-4 text-zinc-400 group cursor-default">
                                    <div className="w-11 h-11 rounded-2xl bg-zinc-50/50 border border-zinc-200 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-500">
                                        <Briefcase className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-none mb-1.5">Occupation</span>
                                        <span className="font-bold text-zinc-900 leading-none">{profile?.occupation || "Not Specified"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-400 group cursor-default">
                                    <div className="w-11 h-11 rounded-2xl bg-zinc-50/50 border border-zinc-200 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all duration-500">
                                        <MapPin className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-none mb-1.5">Region</span>
                                        <span className="font-bold text-zinc-900 leading-none">{profile?.location || "India"}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 h-full pt-12 md:pt-0"
                        >
                            <Button onClick={handleSignOut} className="h-14 bg-zinc-50/50 border border-zinc-200 text-zinc-500 rounded-[1.2rem] px-8 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all font-black uppercase tracking-widest text-[10px]">
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </motion.div>
                    </motion.div>


                    <div className="mt-10 space-y-12">
                        {/* Profile Details Selection */}
                        <section className="space-y-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-4xl font-sans font-black text-zinc-900 mb-2 tracking-tight">Identity & Bio</h2>
                                    <p className="text-zinc-500 font-medium">Manage your personal presence and security protocols.</p>
                                </div>
                                <Button
                                    variant={isEditing ? "destructive" : "default"}
                                    onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                    className={`rounded-2xl px-10 py-6 text-xs font-black uppercase tracking-widest transition-all ${isEditing ? "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 shadow-none" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.2)]"}`}
                                >
                                    {isEditing ? <><X className="mr-2 h-4 w-4" /> Terminate Edit</> : <><Edit2 className="mr-2 h-4 w-4" /> Modify Profile</>}
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 bg-zinc-50/50 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl border border-zinc-200 relative overflow-hidden group/container">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[80px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover/container:scale-150" />

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isEditing ? "editing" : "viewing"}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="contents"
                                    >
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Name</Label>
                                            {isEditing ? (
                                                <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                            ) : (
                                                <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.full_name}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Mobile Number</Label>
                                            {isEditing ? (
                                                <Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                            ) : (
                                                <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.contact_phone || profile?.phone}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Date of Birth</Label>
                                            {isEditing ? (
                                                <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                            ) : (
                                                <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.details?.dob || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Biological Data</Label>
                                            <div className="text-2xl text-zinc-900 font-bold tracking-tight flex items-center gap-3">
                                                {profile?.age} Years <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> <span className="capitalize">{profile?.gender}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Geolocation</Label>
                                            {isEditing ? (
                                                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                            ) : (
                                                <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.location || "-"}</div>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="col-span-full border-t border-zinc-100 pt-8 mt-2">
                                    <h4 className="text-zinc-900 font-sans text-2xl font-black mb-10 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <User className="text-emerald-500 w-5 h-5" />
                                        </div>
                                        Professional & Family Details
                                    </h4>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isEditing ? "editing-extra" : "viewing-extra"}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="grid md:grid-cols-2 gap-x-16 gap-y-12"
                                        >
                                            <div className="space-y-2">
                                                <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Father Name</Label>
                                                {isEditing ? (
                                                    <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                                ) : (
                                                    <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.details?.father_name || "-"}</div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Mother Name</Label>
                                                {isEditing ? (
                                                    <Input value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                                ) : (
                                                    <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.details?.mother_name || "-"}</div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Caste / Community</Label>
                                                {isEditing ? (
                                                    <div className="flex gap-4">
                                                        <Input value={formData.caste} onChange={(e) => setFormData({ ...formData, caste: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                                        <Input value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                                    </div>
                                                ) : (
                                                    <div className="text-2xl text-zinc-900 font-bold tracking-tight">{profile?.details?.caste} / {profile?.details?.community}</div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Salary</Label>
                                                {isEditing ? (
                                                    <Input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="bg-zinc-50/50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50" />
                                                ) : (
                                                    <div className="text-2xl text-emerald-400 font-black tracking-tight drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{profile?.details?.salary || "-"}</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Security Section */}
                                <div className="col-span-full border-t border-zinc-100 pt-8 mt-2">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Lock className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <h3 className="text-2xl font-sans font-black text-zinc-900">Reset Password</h3>
                                    </div>
                                    <div className="max-w-2xl bg-zinc-50/50 p-8 rounded-[2rem] border border-zinc-200 backdrop-blur-3xl">
                                        <form onSubmit={handlePasswordChange} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Enter New Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="bg-zinc-50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Confirm Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.confirm}
                                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="bg-zinc-50 border-zinc-200 text-zinc-900 h-14 rounded-2xl focus:ring-emerald-500/50"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 px-10 py-6 h-auto rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3">
                                                <Save className="w-4 h-4" /> Change Password
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-8 flex justify-end gap-4"
                                >
                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="px-10 py-6 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-colors">Cancel</Button>
                                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-to-tr from-emerald-600 to-amber-500 text-white hover:opacity-90 px-12 py-6 h-auto rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3">
                                        {saving ? "Processing..." : <><Save className="w-5 h-5" />Save Changes</>}
                                    </Button>
                                </motion.div>
                            )}
                        </section>


                        {/* Premium Recommended Profiles Section */}
                        <section className="relative pt-16 pb-10">
                            {/* Decorative Background */}
                            <div className="absolute inset-0 -mx-4 md:-mx-8 bg-black/[0.02] rounded-[4rem] pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[100px] rounded-full pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 blur-[100px] rounded-full pointer-events-none"></div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative z-10"
                            >
                                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-10 text-center md:text-left">
                                    <div className="space-y-4">
                                        <h2 className="text-7xl font-sans font-black text-zinc-900 tracking-tighter leading-tight drop-shadow-2xl">
                                            Recommended <br /> <span className="text-zinc-600">Profiles</span>
                                        </h2>
                                        <p className="text-xl text-zinc-500 max-w-xl font-medium">
                                            "We've found these potential matches for you based on your profile details."
                                        </p>
                                    </div>
                                    <motion.div
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        className="bg-zinc-50/50 backdrop-blur-3xl px-10 py-8 rounded-[2.5rem] flex flex-col items-center gap-1 shadow-2xl border border-zinc-200"
                                    >
                                        <div className="flex items-center gap-4 text-emerald-500">
                                            <Heart className="w-8 h-8 fill-current animate-pulse" />
                                            <span className="text-6xl font-black font-sans italic">{matches.length}</span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 whitespace-nowrap">Profiles Found</span>
                                    </motion.div>
                                </div>

                                {matches.length === 0 ? (
                                    <div className="text-center py-24 bg-zinc-50/50 rounded-[3rem] border border-zinc-200 backdrop-blur-3xl">
                                        <div className="w-20 h-20 bg-emerald-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                                            <Heart className="w-8 h-8 text-emerald-500 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl text-zinc-950 font-sans font-black mb-3 tracking-tight">Finding Matches...</h3>
                                        <p className="text-zinc-500 text-lg max-w-md mx-auto">We are looking for the best matches for you. Please check back soon for new recommendations.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {matches.map((match, idx) => (
                                            <motion.div
                                                key={match.id}
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            >
                                                <Card className="group bg-white rounded-[2.5rem] border border-zinc-200 backdrop-blur-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-700 hover:-translate-y-4 shadow-3xl">
                                                    <div className="relative h-[24rem] bg-zinc-950 overflow-hidden">
                                                        {match.image_url ? (
                                                            <img src={match.image_url} alt={match.full_name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                                <User className="w-20 h-20 text-zinc-800" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90 transition-opacity duration-700"></div>

                                                        {/* Bottom Info Overlay */}
                                                        <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                                                            <div className="flex items-center gap-3 text-amber-400 mb-2">
                                                                <Star className="w-4 h-4 fill-current drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Match</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <CardContent className="p-8 space-y-8 bg-zinc-50/30">
                                                        <div className="space-y-6">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <h3 className="text-3xl font-sans font-black tracking-tighter drop-shadow-2xl leading-none">{match.full_name}</h3>
                                                                <div className="flex items-center text-zinc-500 gap-1.5 shrink-0 pt-1">
                                                                    <MapPin className="w-3 h-3 text-emerald-500/70" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{match.location || "Global"}</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-6 pt-2">
                                                                <div className="space-y-1.5">
                                                                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600">Occupation</span>
                                                                    <p className="text-zinc-900 font-bold truncate flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {match.occupation || "Independent"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            className="w-full h-16 rounded-2xl bg-white text-zinc-950 hover:bg-emerald-600 hover:text-white transition-all duration-500 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.1)] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                                                            onClick={() => {
                                                                setSelectedMatch(match);
                                                                setViewDialogOpen(true);
                                                            }}
                                                        >
                                                            View Profile <Heart className="w-3.5 h-3.5 fill-current" />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </section>
                    </div>

                    {/* Match Details Dialog - Shared with new layout */}
                    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                        <DialogContent className="max-w-5xl bg-white text-zinc-900 border border-zinc-200 max-h-[95vh] overflow-y-auto rounded-[3rem] p-0 shadow-[0_0_100px_rgba(16,185,129,0.1)] backdrop-blur-3xl">
                            {selectedMatch && (
                                <div className="grid md:grid-cols-5 h-auto">
                                    {/* Left Column: Image & Quick Info (2 cols) */}
                                    <div className="md:col-span-2 relative bg-zinc-900 min-h-[500px]">
                                        <div className="absolute inset-0">
                                            {selectedMatch.image_url ? (
                                                <img src={selectedMatch.image_url} alt={selectedMatch.full_name} className="w-full h-full object-cover opacity-90" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                    <User className="w-32 h-32 text-zinc-800" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                                        <div className="absolute bottom-10 left-10 text-white">
                                            <div className="bg-emerald-600/20 backdrop-blur-xl text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl border border-emerald-500/30 mb-6 inline-block shadow-2xl">Verified Profile</div>
                                            <div className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-500 mb-2">Match Rating</div>
                                            <div className="text-7xl font-sans font-black italic text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-amber-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">92%</div>
                                        </div>
                                    </div>

                                    {/* Right Column: Details (3 cols) */}
                                    <div className="md:col-span-3 p-14 space-y-12 text-left bg-white/50">
                                        <DialogHeader>
                                            <DialogTitle className="text-5xl font-sans font-black text-zinc-900 mb-4 tracking-tighter leading-none">
                                                {selectedMatch.full_name}
                                            </DialogTitle>
                                            <div className="flex flex-wrap gap-3">
                                                <span className="bg-zinc-50/50 border border-zinc-200 text-zinc-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedMatch.age} Yrs</span>
                                                <span className="bg-zinc-50/50 border border-zinc-200 text-zinc-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest capitalize">{selectedMatch.gender} Profile</span>
                                                <span className="bg-zinc-50/50 border border-zinc-200 text-zinc-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedMatch.location || "Global"}</span>
                                            </div>
                                        </DialogHeader>

                                        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                                                    <Briefcase className="w-4 h-4 text-emerald-500" />
                                                    <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400">Work & Finance</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1.5">Occupation</div>
                                                        <div className="font-bold text-zinc-900 text-lg">{selectedMatch.occupation || "N/A"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1.5">Salary</div>
                                                        <div className="font-bold text-emerald-400 text-lg">{selectedMatch.details?.salary || "Secure"}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                                                    <User className="w-4 h-4 text-amber-500" />
                                                    <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-amber-500">Family Info</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1.5">Father's Name</div>
                                                        <div className="font-bold text-zinc-900 text-lg">{selectedMatch.details?.father_name || "N/A"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1.5">Mother's Name</div>
                                                        <div className="font-bold text-zinc-900 text-lg">{selectedMatch.details?.mother_name || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-5 col-span-full">
                                                <div className="flex items-center gap-3 border-b border-zinc-200 pb-3">
                                                    <Globe className="w-4 h-4 text-emerald-500" />
                                                    <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400">Cultural Identity</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1.5">Caste / Community</div>
                                                        <div className="font-bold text-zinc-900 text-lg">{selectedMatch.details?.caste} / {selectedMatch.details?.community}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 flex gap-5">
                                            <Button
                                                onClick={() => handleExpressInterest(selectedMatch.id)}
                                                className="flex-1 h-16 bg-gradient-to-tr from-emerald-600 to-amber-500 text-white hover:opacity-90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 transition-all"
                                            >
                                                <MessageCircle className="w-5 h-5 fill-current" /> Express Interest
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDismissMatch(selectedMatch.id)}
                                                className="w-16 h-16 border border-zinc-200 rounded-2xl text-zinc-500 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 transition-all flex items-center justify-center"
                                            >
                                                <X className="w-6 h-6" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </MainLayout>
    );
};

export default MatrimonyProfile;
