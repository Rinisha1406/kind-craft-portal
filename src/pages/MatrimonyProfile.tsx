import { useState, useEffect } from "react";
import { supabase, API_URL } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Lock, User, Save, LogOut, Heart, MessageCircle, MapPin, Briefcase, Edit2, X, Star, Loader2, Phone } from "lucide-react";
import { motion } from "framer-motion";

const MatrimonyProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

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

    const [passwordData, setPasswordData] = useState({ new: "", confirm: "" });
    const [matches, setMatches] = useState<any[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = '/matrimony'; return; }
            const { data, error } = await supabase.from('matrimony_profiles').select('*').eq('user_id', user.id).single();
            if (error) throw error;
            setProfile(data);
            setImage(data.image_url);
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
            if (data.gender) {
                const response = await fetch(`${API_URL}/matches.php?gender=${data.gender}&exclude_id=${data.id}`);
                const matchesData = await response.json();
                if (Array.isArray(matchesData)) setMatches(matchesData);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'matrimony');
        try {
            const uploadResponse = await fetch(`${API_URL}/upload.php`, { method: 'POST', body: uploadFormData });
            const uploadResult = await uploadResponse.json();
            if (uploadResult.error) throw new Error(uploadResult.error);
            const fullImageUrl = `${API_URL}${uploadResult.data.publicUrl}`;
            if (profile?.id) {
                await fetch(`${API_URL}/matrimony_profiles.php?id=${profile.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: fullImageUrl })
                });
            }
            setImage(fullImageUrl);
            toast({ title: "Success", description: "Profile photo updated!" });
            fetchProfile();
        } catch (error: any) { toast({ title: "Upload Failed", description: error.message, variant: "destructive" }); }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const details = { ...profile.details, dob: formData.dob, father_name: formData.father_name, mother_name: formData.mother_name, caste: formData.caste, community: formData.community, salary: formData.salary };
            const { error } = await supabase.from('matrimony_profiles').update({ full_name: formData.full_name, contact_phone: formData.contact_phone, occupation: formData.occupation, location: formData.location, details: details }).eq('id', profile.id);
            if (error) throw error;
            toast({ title: "Success", description: "Bio Data updated!" });
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); } finally { setSaving(false); }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) { toast({ title: "Error", description: "Passwords do not match", variant: "destructive" }); return; }
        try {
            const { error: authError } = await supabase.auth.updateUser({ password: passwordData.new });
            if (authError) throw authError;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await fetch(`${API_URL}/auth/reset_matrimony_password.php`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.id}` }, body: JSON.stringify({ password: passwordData.new }) });
                await supabase.from('matrimony_profiles').update({ details: { ...profile?.details, password_plain: passwordData.new } }).eq('user_id', user.id);
                toast({ title: "Success", description: "Security updated!" });
                setPasswordData({ new: "", confirm: "" });
            }
        } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    };

    const handleExpressInterest = async (matchId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('matrimony_interests').insert({ sender_id: user.id, receiver_id: matchId, status: 'pending' });
            if (error) { if (error.code === '23505') toast({ title: "Already Sent" }); else throw error; }
            else { toast({ title: "Interest Sent!" }); }
        } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>;

    const CompactBioRow = ({ label, value, isEditing, onChange, type = "text" }: any) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider w-1/3">{label}</span>
            <div className="w-2/3 text-right sm:text-left">
                {isEditing ? (
                    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs bg-gray-50 border-gray-200 rounded-lg text-right sm:text-left" />
                ) : (
                    <span className="text-gray-900 text-xs font-bold">{value || "-"}</span>
                )}
            </div>
        </div>
    );

    return (
        <MainLayout showFooter={false}>
            <div className="min-h-screen bg-gray-100/50 pt-20 pb-10">
                <div className="container mx-auto px-2 sm:px-4 max-w-4xl">

                    {/* Compact Header */}
                    <div className="bg-white border-b sm:border sm:rounded-2xl p-4 mb-4 flex items-center gap-4 shadow-sm">
                        <div className="relative group shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border bg-gray-50">
                                {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-8 h-8 text-gray-300" /></div>}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 cursor-pointer rounded-xl transition-all">
                                <Camera className="w-4 h-4 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-xl font-serif font-black text-gray-900 truncate">{profile?.full_name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{profile?.gender}</span>
                                <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{profile?.age} yrs</span>
                            </div>
                        </div>
                        <Button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/matrimony')} variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 rounded-lg h-9 w-9 p-0 sm:w-auto sm:px-3">
                            <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Exit</span>
                        </Button>
                    </div>

                    <Tabs defaultValue="matches" className="space-y-4">
                        <TabsList className="bg-white border p-1 rounded-xl h-11 w-full flex">
                            <TabsTrigger value="matches" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-gold data-[state=active]:text-white">Matches</TabsTrigger>
                            <TabsTrigger value="profile" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-gold data-[state=active]:text-white">Bio Data</TabsTrigger>
                            <TabsTrigger value="settings" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-gold data-[state=active]:text-white">Access</TabsTrigger>
                        </TabsList>

                        {/* Ultra Compact Matches */}
                        <TabsContent value="matches" className="outline-none space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {matches.map((match) => (
                                    <motion.div
                                        key={match.id}
                                        onClick={() => { setSelectedMatch(match); setViewDialogOpen(true); }}
                                        className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-center p-2 pt-0"
                                    >
                                        <div className="w-full aspect-square sm:aspect-[4/5] relative rounded-lg overflow-hidden mt-2">
                                            {match.image_url ? <img src={match.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" /> : <div className="w-full h-full bg-gray-50 flex items-center justify-center"><User className="w-10 h-10 text-gray-200" /></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                            <div className="absolute bottom-2 left-2 right-2 text-white">
                                                <p className="text-[12px] font-bold truncate">{match.full_name}</p>
                                                <p className="text-[9px] opacity-80">{match.age} yrs • {match.location || "India"}</p>
                                            </div>
                                        </div>
                                        <div className="w-full py-2 flex items-center justify-between gap-1 mt-1">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate flex-1">{match.occupation || "Profile"}</span>
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); handleExpressInterest(match.id); }} className="w-6 h-6 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Heart className="w-3 h-3 fill-current" /></button>
                                                <button className="w-6 h-6 flex items-center justify-center bg-gray-900 text-white rounded-lg"><MessageCircle className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            {matches.length === 0 && <div className="text-center py-20 bg-white border border-dashed rounded-2xl"><Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Finding Matches...</p></div>}
                        </TabsContent>

                        {/* High Density Bio Data */}
                        <TabsContent value="profile" className="outline-none">
                            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-4 sm:p-6 border-b flex items-center justify-between bg-gray-50/50">
                                    <h2 className="text-sm font-serif font-black text-gray-900 uppercase tracking-widest">Formal Bio Data</h2>
                                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "destructive" : "outline"} size="sm" className="h-8 text-[10px] font-black px-4 rounded-lg">
                                        {isEditing ? "Discard" : "Modify"}
                                    </Button>
                                </div>
                                <div className="p-4 sm:p-8 space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                                        <section>
                                            <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-3 pb-1 border-b">I. Personal Profile</h3>
                                            <CompactBioRow label="Full Identity" value={formData.full_name} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, full_name: v })} />
                                            <CompactBioRow label="Date of Birth" value={formData.dob} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, dob: v })} type="date" />
                                            <CompactBioRow label="Contact Phone" value={formData.contact_phone} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, contact_phone: v })} />
                                            <CompactBioRow label="Residency" value={formData.location} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, location: v })} />
                                        </section>
                                        <section>
                                            <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-3 pb-1 border-b">II. Career & Culture</h3>
                                            <CompactBioRow label="Occupation" value={formData.occupation} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, occupation: v })} />
                                            <CompactBioRow label="Annual Salary" value={formData.salary} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, salary: v })} />
                                            <CompactBioRow label="Caste / Community" value={`${formData.caste}${formData.caste && formData.community ? " / " : ""}${formData.community}`} isEditing={isEditing} onChange={(v: any) => {
                                                const parts = v.split("/");
                                                setFormData({ ...formData, caste: parts[0]?.trim() || "", community: parts[1]?.trim() || "" });
                                            }} />
                                        </section>
                                        <section className="sm:col-span-2">
                                            <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-3 pb-1 border-b">III. Family Background</h3>
                                            <div className="grid sm:grid-cols-2 gap-x-12">
                                                <CompactBioRow label="Father's Name" value={formData.father_name} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, father_name: v })} />
                                                <CompactBioRow label="Mother's Name" value={formData.mother_name} isEditing={isEditing} onChange={(v: any) => setFormData({ ...formData, mother_name: v })} />
                                            </div>
                                        </section>
                                    </div>
                                    {isEditing && (
                                        <div className="flex justify-center pt-4 border-t">
                                            <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto px-12 h-10 gold-gradient text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-gold/20 flex items-center gap-2">
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Bio Data
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Compact Settings */}
                        <TabsContent value="settings" className="outline-none">
                            <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-sm mx-auto">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2"><Lock className="w-4 h-4 text-gold" /> Access Security</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">New Password</Label>
                                        <Input type="password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} className="h-9 text-xs rounded-lg bg-gray-50" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Verify Password</Label>
                                        <Input type="password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} className="h-9 text-xs rounded-lg bg-gray-50" placeholder="••••••••" />
                                    </div>
                                    <Button type="submit" className="w-full h-10 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mt-2 transition-all hover:bg-black">Authorize Change</Button>
                                </form>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Compact Match Details Modal */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
                        {selectedMatch && (
                            <div className="flex flex-col">
                                <div className="h-64 relative">
                                    {selectedMatch.image_url ? <img src={selectedMatch.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><User className="w-20 h-20 text-gray-200" /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                    <button onClick={() => setViewDialogOpen(false)} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="p-6">
                                    <h2 className="text-xl font-serif font-black text-gray-900 flex items-center justify-between mb-1">{selectedMatch.full_name}<span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded tracking-widest uppercase border border-emerald-100">Verified</span></h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {selectedMatch.location || "Global Region"}</p>

                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                                        <div><Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Age</Label><p className="text-xs font-bold text-gray-900">{selectedMatch.age} Years</p></div>
                                        <div><Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Occupation</Label><p className="text-xs font-bold text-gray-900 truncate">{selectedMatch.occupation || "N/A"}</p></div>
                                        <div><Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Caste</Label><p className="text-xs font-bold text-gray-900">{selectedMatch.details?.caste || "Open"}</p></div>
                                        <div><Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Salary</Label><p className="text-xs font-black text-emerald-600">{selectedMatch.details?.salary || "Secure"}</p></div>
                                    </div>

                                    <div className="space-y-3 py-4 border-y border-gray-100 mb-6">
                                        <div className="flex justify-between items-center"><span className="text-[10px] text-gray-400 font-medium">Family</span><span className="text-[10px] font-bold text-gray-900">{selectedMatch.details?.father_name || "N/A"} (Father)</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[10px] text-gray-400 font-medium">Mother</span><span className="text-[10px] font-bold text-gray-900">{selectedMatch.details?.mother_name || "N/A"}</span></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={() => handleExpressInterest(selectedMatch.id)} className="flex-1 h-11 gold-gradient text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-gold/20 flex items-center justify-center gap-2">
                                            <Heart className="w-4 h-4 fill-current" /> Express Interest
                                        </Button>
                                        <Button onClick={() => setViewDialogOpen(false)} variant="outline" className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">Close</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default MatrimonyProfile;
