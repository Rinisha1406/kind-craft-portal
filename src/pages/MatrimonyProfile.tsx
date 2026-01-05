import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Lock, User, Save, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const MatrimonyProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const { toast } = useToast();

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

            // Fetch profile details
            // Assuming we have an endpoint or can query matrimony_profiles
            // Since we are using the PHP compat layer, supabase.from('matrimony_profiles').select('*').eq('user_id', user.id).single()
            const { data, error } = await supabase
                .from('matrimony_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
            setImage(data.image_url);
        } catch (error) {
            console.error(error);
            // toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
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

            const publicUrl = data.path; // PHP adapter returns full URL or path
            setImage(publicUrl);

            // Update profile
            await supabase.from('matrimony_profiles').update({ image_url: publicUrl }).eq('id', profile.id);

            toast({ title: "Success", description: "Profile photo updated!" });
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
            return;
        }

        try {
            // Need a change password endpoint
            // supabase.auth.updateUser({ password: passwordData.new })
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

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <MainLayout showFooter={true}>
            <div className="min-h-screen bg-charcoal text-champagne py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gold/20 pb-6">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-champagne">My Profile</h1>
                            <p className="text-champagne/60">Manage your account details and preferences</p>
                        </div>
                        <Button onClick={handleSignOut} variant="ghost" className="text-rose-gold hover:text-rose-gold/80 hover:bg-rose-gold/10">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left Column: Image & Basic Info */}
                        <div className="md:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-gold/20 rounded-2xl p-6 text-center space-y-4"
                            >
                                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gold/50">
                                    {image ? (
                                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-charcoal/50 flex items-center justify-center">
                                            <User className="w-12 h-12 text-champagne/30" />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-gold">{profile?.full_name}</h3>
                                    <p className="text-sm text-champagne/60">{profile?.occupation || "No Occupation"}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Details & Settings */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Detailed Info (Read Only or Editable later) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 border border-gold/20 rounded-2xl p-6 space-y-4"
                            >
                                <h3 className="text-lg font-medium text-champagne flex items-center gap-2">
                                    <User className="w-5 h-5 text-gold" /> Personal Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-champagne/40">Age</span>
                                        <span className="text-champagne/80">{profile?.age}</span>
                                    </div>
                                    <div>
                                        <span className="block text-champagne/40">Gender</span>
                                        <span className="text-champagne/80 capitalize">{profile?.gender}</span>
                                    </div>
                                    <div>
                                        <span className="block text-champagne/40">Location</span>
                                        <span className="text-champagne/80">{profile?.location || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-champagne/40">Status</span>
                                        <span className="text-champagne/80">Active</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Change Password */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 border border-gold/20 rounded-2xl p-6 space-y-4"
                            >
                                <h3 className="text-lg font-medium text-champagne flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-gold" /> Change Password
                                </h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.new}
                                            onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                            className="bg-black/20 border-gold/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirm}
                                            onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            className="bg-black/20 border-gold/20"
                                        />
                                    </div>
                                    <Button type="submit" className="gold-gradient text-primary-foreground">
                                        <Save className="mr-2 h-4 w-4" /> Update Password
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MatrimonyProfile;
