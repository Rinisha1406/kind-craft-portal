
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
            <div className="min-h-screen bg-zinc-50 text-zinc-900 relative">

                {/* Hero Banner */}
                <div className="h-64 w-full bg-gradient-to-r from-black via-zinc-900 to-gold/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-charcoal"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl py-8 mb-12">

                    {/* Profile Header Block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row gap-6 items-end pb-8 border-b border-zinc-200"
                    >
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white ring-2 ring-gold shadow-2xl bg-black">
                                {image ? (
                                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                        <User className="w-20 h-20 text-zinc-300" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                <Camera className="w-8 h-8" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <div className="absolute bottom-2 right-2 bg-gold text-charcoal p-1.5 rounded-full border-2 border-white">
                                <Shield className="w-4 h-4 fill-current" />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 mb-2">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-2">
                                {profile?.full_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-zinc-600">
                                <span className="flex items-center gap-1 bg-gold/10 px-3 py-1 rounded-full text-sm border border-gold/20 text-gold font-medium">
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
                            <Button onClick={handleSignOut} variant="outline" className="border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200">
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </motion.div>


                    <div className="mt-8 pb-12 w-full">
                        {/* Main Content - Full Width */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full"
                        >
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="bg-zinc-100 border border-zinc-200 p-1 mb-8 w-full justify-start">
                                    <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-gold data-[state=active]:shadow-sm text-zinc-500 flex-1 md:flex-none">My Details</TabsTrigger>
                                    <TabsTrigger value="matches" className="data-[state=active]:bg-white data-[state=active]:text-gold data-[state=active]:shadow-sm text-zinc-500 flex-1 md:flex-none">My Matches</TabsTrigger>
                                    <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-gold data-[state=active]:shadow-sm text-zinc-500 flex-1 md:flex-none">Settings</TabsTrigger>
                                </TabsList>

                                {/* Profile Details Tab (No Card Wrapper) */}
                                <TabsContent value="profile" className="space-y-8">
                                    <div className="flex flex-row items-center justify-between pb-4 border-b border-zinc-200">
                                        <div>
                                            <h2 className="text-2xl font-serif text-zinc-900">Personal Information</h2>
                                            <p className="text-zinc-500">Manage your personal and professional details</p>
                                        </div>
                                        <Button
                                            variant={isEditing ? "destructive" : "default"}
                                            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                            className={isEditing ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-gold text-white hover:bg-gold/90"}
                                        >
                                            {isEditing ? <><X className="mr-2 h-4 w-4" /> Cancel View</> : <><Edit2 className="mr-2 h-4 w-4" /> Edit Details</>}
                                        </Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                        {/* Fields */}
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Full Name</Label>
                                            {isEditing ? (
                                                <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.full_name}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Mobile Number</Label>
                                            {isEditing ? (
                                                <Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.contact_phone || profile?.phone}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Date of Birth</Label>
                                            {isEditing ? (
                                                <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.details?.dob || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Age</Label>
                                            <div className="text-lg text-zinc-900 font-medium">{profile?.age} Years</div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Gender</Label>
                                            <div className="text-lg text-zinc-900 font-medium capitalize">{profile?.gender}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Location</Label>
                                            {isEditing ? (
                                                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.location || "-"}</div>
                                            )}
                                        </div>

                                        <div className="col-span-full border-t border-zinc-200 pt-6 mt-2">
                                            <h4 className="text-zinc-800 font-serif text-lg mb-6">Family & Professional Details</h4>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Father's Name</Label>
                                            {isEditing ? (
                                                <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.details?.father_name || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Mother's Name</Label>
                                            {isEditing ? (
                                                <Input value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.details?.mother_name || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Caste</Label>
                                            {isEditing ? (
                                                <Input value={formData.caste} onChange={(e) => setFormData({ ...formData, caste: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.details?.caste || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Community</Label>
                                            {isEditing ? (
                                                <Input value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.details?.community || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Occupation</Label>
                                            {isEditing ? (
                                                <Input value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.occupation || "-"}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-xs uppercase tracking-wider">Annual Salary</Label>
                                            {isEditing ? (
                                                <Input value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="bg-white border-zinc-300 text-zinc-900 p-2" />
                                            ) : (
                                                <div className="text-lg text-zinc-900 font-medium">{profile?.details?.salary || "-"}</div>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-zinc-200">
                                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-zinc-900">Cancel</Button>
                                            <Button onClick={handleSaveProfile} disabled={saving} className="bg-gold text-white hover:bg-gold/90 px-8">
                                                {saving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* My Matches Tab */}
                                <TabsContent value="matches" className="space-y-6">
                                    {matches.length === 0 ? (
                                        <div className="text-center py-20 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">
                                            <Heart className="w-16 h-16 mx-auto mb-6 text-zinc-200" />
                                            <h3 className="text-xl text-zinc-900 font-medium mb-2">No Matches Found Yet</h3>
                                            <p className="text-zinc-500">We are currently looking for profiles that match your preferences.</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {matches.map((match) => (
                                                <Card key={match.id} className="bg-white border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow">
                                                    <div className="relative h-64 bg-zinc-100">
                                                        {match.image_url ? (
                                                            <img src={match.image_url} alt={match.full_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <User className="w-20 h-20 text-zinc-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-zinc-800 shadow-sm">
                                                            {match.age ? `${match.age} yrs` : 'Age N/A'}
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-6">
                                                        <h3 className="text-xl font-serif text-zinc-900 mb-1">{match.full_name}</h3>
                                                        <div className="space-y-2 mb-6">
                                                            <div className="flex items-center text-sm text-zinc-600">
                                                                <Briefcase className="w-4 h-4 mr-2 text-gold" />
                                                                {match.occupation || "Not Specified"}
                                                            </div>
                                                            <div className="flex items-center text-sm text-zinc-600">
                                                                <MapPin className="w-4 h-4 mr-2 text-gold" />
                                                                {match.location || "Location N/A"}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className="w-full bg-gold text-white hover:bg-gold/90"
                                                            onClick={() => {
                                                                setSelectedMatch(match);
                                                                setViewDialogOpen(true);
                                                            }}
                                                        >
                                                            View Full Profile
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    {/* Match Details Dialog */}
                                    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                                        <DialogContent className="max-w-3xl bg-white text-zinc-900 border-zinc-200 max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-serif text-gold">Profile Details</DialogTitle>
                                            </DialogHeader>

                                            {selectedMatch && (
                                                <div className="grid md:grid-cols-3 gap-8 pt-4">
                                                    {/* Left Column: Image & Quick Info */}
                                                    <div className="md:col-span-1 space-y-4">
                                                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                                                            {selectedMatch.image_url ? (
                                                                <img src={selectedMatch.image_url} alt={selectedMatch.full_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <User className="w-20 h-20 text-zinc-300" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-center">
                                                            <div className="text-sm text-zinc-500 uppercase tracking-widest mb-1">Match Score</div>
                                                            <div className="text-3xl font-bold text-gold">92%</div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column: Details */}
                                                    <div className="md:col-span-2 space-y-8">
                                                        <div>
                                                            <h2 className="text-3xl font-serif font-bold text-zinc-900 mb-2">{selectedMatch.full_name}</h2>
                                                            <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
                                                                <span className="bg-gold/10 text-gold-darker px-3 py-1 rounded-full">{selectedMatch.age} Years</span>
                                                                <span className="bg-gold/10 text-gold-darker px-3 py-1 rounded-full">{selectedMatch.gender}</span>
                                                                <span className="bg-gold/10 text-gold-darker px-3 py-1 rounded-full">{selectedMatch.location}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h3 className="font-serif text-lg border-b border-zinc-200 pb-2 text-zinc-800">Professional Details</h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <div className="text-xs text-zinc-500 uppercase">Occupation</div>
                                                                    <div className="font-medium">{selectedMatch.occupation || "-"}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-zinc-500 uppercase">Annual Salary</div>
                                                                    <div className="font-medium">{selectedMatch.details?.salary || "-"}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h3 className="font-serif text-lg border-b border-zinc-200 pb-2 text-zinc-800">Family Background</h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <div className="text-xs text-zinc-500 uppercase">Father's Name</div>
                                                                    <div className="font-medium">{selectedMatch.details?.father_name || "-"}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-zinc-500 uppercase">Mother's Name</div>
                                                                    <div className="font-medium">{selectedMatch.details?.mother_name || "-"}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-zinc-500 uppercase">Caste</div>
                                                                    <div className="font-medium">{selectedMatch.details?.caste || "-"}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-zinc-500 uppercase">Community</div>
                                                                    <div className="font-medium">{selectedMatch.details?.community || "-"}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 flex gap-4">
                                                            <Button className="flex-1 bg-gold text-white hover:bg-gold/90">
                                                                <MessageCircle className="w-4 h-4 mr-2" /> Send Interest
                                                            </Button>
                                                            <Button variant="outline" className="border-zinc-300">
                                                                Ignore
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TabsContent>

                                {/* Settings Tab */}
                                <TabsContent value="settings" className="space-y-6">
                                    <Card className="bg-white border-zinc-200 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-zinc-900 flex items-center gap-2">
                                                <Lock className="w-5 h-5 text-gold" /> Security Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-700">New Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="bg-white border-zinc-300 text-zinc-900"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-700">Confirm Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={passwordData.confirm}
                                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="bg-white border-zinc-300 text-zinc-900"
                                                    />
                                                </div>
                                                <Button type="submit" className="bg-gold text-white hover:bg-gold/90">
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
