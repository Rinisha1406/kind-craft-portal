
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Lock, User, Save, LogOut, Heart, MessageCircle, Settings, Shield, Bell, MapPin, Briefcase, Edit2, X } from "lucide-react";
import { motion } from "framer-motion";

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

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { data, error } = await supabase.storage.from('profiles').upload(`matrimony/${Date.now()}_${file.name}`, file);
            if (error) throw error;

            const publicUrl = data.path;
            setImage(publicUrl);
            await supabase.from('matrimony_profiles').update({ image_url: publicUrl }).eq('id', profile.id);

            toast({ title: "Success", description: "Profile photo updated!" });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
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
            const { error } = await supabase.auth.updateUser({ password: passwordData.new });
            if (error) throw error;
            toast({ title: "Success", description: "Password updated successfully!" });
            setPasswordData({ current: "", new: "", confirm: "" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
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
            <div className="min-h-screen bg-charcoal text-champagne relative">

                {/* Hero Banner */}
                <div className="h-64 w-full bg-gradient-to-r from-black via-zinc-900 to-gold/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-charcoal"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10">

                    {/* Profile Header Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row gap-6 items-end pb-8 border-b border-gold/10"
                    >
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-charcoal ring-2 ring-gold shadow-2xl bg-black">
                                {image ? (
                                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                        <User className="w-20 h-20 text-gold/50" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                <Camera className="w-8 h-8" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <div className="absolute bottom-2 right-2 bg-gold text-charcoal p-1.5 rounded-full border-2 border-charcoal">
                                <Shield className="w-4 h-4 fill-current" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 mb-2">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                                {profile?.full_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-champagne/80">
                                <span className="flex items-center gap-1 bg-gold/10 px-3 py-1 rounded-full text-sm border border-gold/20 text-gold">
                                    <Shield className="w-3 h-3" /> Premium Member
                                </span>
                                <span className="flex items-center gap-1 text-sm">
                                    <Briefcase className="w-3 h-3 text-gold" /> {profile?.occupation || "Add Occupation"}
                                </span>
                                <span className="flex items-center gap-1 text-sm">
                                    <MapPin className="w-3 h-3 text-gold" /> {profile?.location || "Add Location"}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mb-4">
                            <Button onClick={handleSignOut} variant="outline" className="border-gold/30 text-rose-gold hover:bg-rose-gold/10 bg-black/40 backdrop-blur-md">
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </motion.div>


                    <div className="grid lg:grid-cols-4 gap-8 mt-8 pb-12">
                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            <Card className="bg-gradient-to-br from-zinc-900 to-black border-gold/20 shadow-xl">
                                <CardContent className="p-6">
                                    <div className="w-full space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-serif text-lg text-gold">Profile Strength</h3>
                                            <span className="text-gold font-bold">85%</span>
                                        </div>
                                        <Progress value={85} className="h-2 bg-zinc-800" />
                                        <p className="text-xs text-zinc-400">Complete your profile to get more matches.</p>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        <Button variant="ghost" className="w-full justify-start text-champagne hover:text-gold hover:bg-gold/5">
                                            <User className="mr-2 h-4 w-4" /> View Public Profile
                                        </Button>
                                        <Button variant="ghost" className="w-full justify-start text-champagne hover:text-gold hover:bg-gold/5">
                                            <Bell className="mr-2 h-4 w-4" /> Notifications
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-3"
                        >
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="bg-black/40 border border-gold/10 p-1 mb-8 w-full justify-start">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex-1 md:flex-none">Overview</TabsTrigger>
                                    <TabsTrigger value="profile" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex-1 md:flex-none">My Details</TabsTrigger>
                                    <TabsTrigger value="matches" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex-1 md:flex-none">My Matches</TabsTrigger>
                                    <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal flex-1 md:flex-none">Settings</TabsTrigger>
                                </TabsList>

                                {/* Overview Tab */}
                                <TabsContent value="overview" className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <Card className="bg-gradient-to-br from-zinc-900 to-black border-gold/20 hover:border-gold/50 transition-all cursor-pointer group">
                                            <CardContent className="p-6 flex items-center gap-4">
                                                <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold group-hover:text-charcoal transition-colors">
                                                    <Heart className="w-6 h-6 text-gold group-hover:text-charcoal" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-zinc-400">New Matches</p>
                                                    <p className="text-3xl font-bold text-white">0</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-gradient-to-br from-zinc-900 to-black border-gold/20 hover:border-gold/50 transition-all cursor-pointer group">
                                            <CardContent className="p-6 flex items-center gap-4">
                                                <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold group-hover:text-charcoal transition-colors">
                                                    <User className="w-6 h-6 text-gold group-hover:text-charcoal" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-zinc-400">Profile Views</p>
                                                    <p className="text-3xl font-bold text-white">48</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-gradient-to-br from-zinc-900 to-black border-gold/20 hover:border-gold/50 transition-all cursor-pointer group">
                                            <CardContent className="p-6 flex items-center gap-4">
                                                <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold group-hover:text-charcoal transition-colors">
                                                    <MessageCircle className="w-6 h-6 text-gold group-hover:text-charcoal" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-zinc-400">Messages</p>
                                                    <p className="text-3xl font-bold text-white">5</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="mt-8 p-8 bg-black/20 rounded-xl border border-white/5 text-center">
                                        <h3 className="text-xl font-serif text-gold mb-2">Welcome to your Premium Dashboard</h3>
                                        <p className="text-zinc-400 max-w-lg mx-auto">This is your personal space to manage your profile and find your perfect match. Complete your details to get started.</p>
                                    </div>
                                </TabsContent>

                                {/* Profile Details Tab (CRUD Active) */}
                                <TabsContent value="profile" className="space-y-6">
                                    <Card className="bg-black/40 border-gold/20 backdrop-blur-sm">
                                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                                            <div>
                                                <CardTitle className="text-2xl font-serif text-gold">Personal Information</CardTitle>
                                                <CardDescription className="text-zinc-500">Manage your personal and professional details</CardDescription>
                                            </div>
                                            <Button
                                                variant={isEditing ? "destructive" : "default"}
                                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                                className={isEditing ? "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20" : "bg-gold text-charcoal hover:bg-gold/80"}
                                            >
                                                {isEditing ? <><X className="mr-2 h-4 w-4" /> Cancel View</> : <><Edit2 className="mr-2 h-4 w-4" /> Edit Details</>}
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="pt-8">
                                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                                {/* Fields */}
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Full Name</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.full_name}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Mobile Number</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.contact_phone || profile?.phone}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Date of Birth</Label>
                                                    {isEditing ? (
                                                        <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.details?.dob || "-"}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Age</Label>
                                                    <div className="text-lg text-white font-medium">{profile?.age} Years</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Gender</Label>
                                                    <div className="text-lg text-white font-medium capitalize">{profile?.gender}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Location</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.location || "-"}</div>
                                                    )}
                                                </div>

                                                <div className="col-span-full border-t border-white/5 pt-6 mt-2">
                                                    <h4 className="text-gold font-serif text-lg mb-6">Family & Professional Details</h4>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Father's Name</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.details?.father_name || "-"}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Mother's Name</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.details?.mother_name || "-"}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Caste</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.caste} onChange={(e) => setFormData({ ...formData, caste: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.details?.caste || "-"}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Community</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.details?.community || "-"}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Occupation</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.occupation || "-"}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gold/70 text-xs uppercase tracking-wider">Annual Salary</Label>
                                                    {isEditing ? (
                                                        <Input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="bg-white/10 border-gold/30 text-white p-2" />
                                                    ) : (
                                                        <div className="text-lg text-white font-medium">{profile?.details?.salary || "-"}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {isEditing && (
                                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/5">
                                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                                                    <Button onClick={handleSaveProfile} disabled={saving} className="bg-gold text-charcoal hover:bg-gold/80 px-8">
                                                        {saving ? "Saving..." : "Save Changes"}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* My Matches Tab */}
                                <TabsContent value="matches" className="space-y-6">
                                    <div className="text-center py-20 bg-black/20 rounded-xl border border-gold/10">
                                        <Heart className="w-16 h-16 mx-auto mb-6 text-gold/30" />
                                        <h3 className="text-xl text-white font-medium mb-2">No Matches Found</h3>
                                        <p className="text-zinc-500">We are currently looking for profiles that match your preferences.</p>
                                    </div>
                                </TabsContent>

                                {/* Settings Tab */}
                                <TabsContent value="settings" className="space-y-6">
                                    <Card className="bg-black/40 border-gold/20 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-gold flex items-center gap-2">
                                                <Lock className="w-5 h-5" /> Security Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-300">New Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="bg-black/50 border-gold/20 text-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-300">Confirm Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.confirm}
                                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="bg-black/50 border-gold/20 text-white"
                                                    />
                                                </div>
                                                <Button type="submit" className="bg-gold text-charcoal hover:bg-gold/80">
                                                    <Save className="mr-2 h-4 w-4" /> Update Password
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MatrimonyProfile;
