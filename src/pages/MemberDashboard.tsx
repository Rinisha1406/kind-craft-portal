import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/integrations/supabase/client";
import {
    Heart,
    Layout,
    Briefcase,
    Gift,
    Star,
    ShieldCheck,
    Settings,
    User,
    Crown,
    Sparkles,
    ArrowRight,
    LogOut,
    Share2,
    Copy,
    Users,
    Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const MemberDashboard = () => {
    const { user, signOut } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchMemberProfile();
        }
    }, [user]);

    const fetchMemberProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/members.php`, {
                headers: { 'Authorization': `Bearer ${user?.id}` }
            });
            const result = await response.json();
            if (result.data && result.data.length > 0) {
                setMemberData(result.data[0]);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = () => {
        if (!memberData?.referral_code) return;
        navigator.clipboard.writeText(memberData.referral_code);
        toast({ title: "Copied!", description: "Referral code copied to clipboard." });
    };

    const shareOnWhatsApp = () => {
        if (!memberData?.referral_code) return;
        const text = `Join Kind Craft Portal and use my referral code: ${memberData.referral_code} to get exclusive benefits! Join here: ${window.location.origin}/members`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const cards = [
        {
            title: "My Profile",
            description: "Manage your personal details and address information",
            icon: User,
            link: "/member/profile",
            color: "bg-gold/5"
        },
        {
            title: "Manage Services",
            description: "List and manage the professional services you offer",
            icon: Briefcase,
            link: "/member/manage-services",
            color: "bg-orange-50"
        },
    ];

    if (loading) return (
        <MainLayout showFooter={false}>
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
            </div>
        </MainLayout>
    );

    return (
        <MainLayout showFooter={false}>
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 text-gold mb-3">
                                <Crown className="w-5 h-5" />
                                <span className="font-serif font-bold uppercase tracking-widest text-[10px]">Elite Member Dashboard</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-black text-gray-900 mb-2">
                                Welcome, {memberData?.full_name?.split(' ')[0] || 'Member'}
                            </h1>
                            <p className="text-gray-500 text-sm max-w-xl leading-relaxed">
                                Your personal hub for exclusive benefits and service management.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                signOut();
                                navigate("/members");
                            }}
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 gap-2 shrink-0 rounded-xl"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </motion.div>

                    {/* Referral Section - Light Theme */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 bg-white border border-gold/20 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group shadow-sm"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users size={120} className="text-gold" />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2 flex items-center justify-center lg:justify-start gap-3">
                                    Member Referral Program <Sparkles className="w-5 h-5 text-gold" />
                                </h2>
                                <p className="text-gray-500 text-sm max-w-md mx-auto lg:mx-0">
                                    Share the exclusive experience with your network and grow our community together.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="text-center sm:text-left sm:pr-6 sm:border-r border-gray-200">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Your Code</p>
                                    <p className="text-xl font-mono font-black text-gray-900 tracking-wider">{memberData?.referral_code || '------'}</p>
                                </div>
                                <div className="text-center sm:pl-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total Referrals</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-2xl font-black text-gold">{memberData?.referral_count || 0}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:ml-4">
                                    <Button onClick={copyReferralCode} variant="ghost" className="bg-white text-gray-600 hover:bg-gray-100 h-10 w-10 p-0 rounded-xl border border-gray-200">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={shareOnWhatsApp} className="bg-gold hover:bg-gold-600 text-white font-black h-10 px-6 rounded-xl flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dashboard Grid - Light Theme */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <Link to={card.link} className="block h-full group">
                                    <div className={`h-full ${card.color} border border-gray-100 rounded-[2.5rem] p-8 hover:border-gold/40 transition-all hover:translate-y-[-4px] overflow-hidden relative shadow-sm`}>
                                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <card.icon size={160} className="text-gold/20" />
                                        </div>
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-gold/10 group-hover:border-gold/20 transition-colors shadow-sm">
                                            <card.icon className="w-7 h-7 text-gold" />
                                        </div>
                                        <h3 className="text-2xl font-serif font-black text-gray-900 mb-4 flex items-center gap-3">
                                            {card.title} <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all font-bold" />
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                            {card.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MemberDashboard;
