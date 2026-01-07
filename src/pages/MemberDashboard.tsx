import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
    ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MemberDashboard = () => {
    const { user } = useAuth();

    const cards = [
        {
            title: "My Profile",
            description: "Manage your personal details and address information",
            icon: User,
            link: "/member/profile",
            color: "from-gold/20 to-gold/5"
        },
        {
            title: "Matrimony",
            description: "Explore elite matches and manage your matrimony profile",
            icon: Heart,
            link: "/matrimony",
            color: "from-emerald-500/20 to-emerald-500/5"
        },
        {
            title: "Elite Services",
            description: "Access premium services curated exclusively for members",
            icon: Star,
            link: "/services",
            color: "from-blue-500/20 to-blue-500/5"
        },
        {
            title: "Manage Services",
            description: "List and manage the professional services you offer",
            icon: Briefcase,
            link: "/member/manage-services",
            color: "from-orange-500/20 to-orange-500/5"
        },
        {
            title: "Community Market",
            description: "Check out your exclusive discounts and special offers",
            icon: Gift,
            link: "#",
            color: "from-purple-500/20 to-purple-500/5"
        }
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 text-gold mb-4">
                            <Crown className="w-6 h-6" />
                            <span className="font-serif font-bold uppercase tracking-widest text-sm">Premium Member Dashboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-champagne mb-4">
                            Welcome Back, <span className="text-gold-gradient">Member</span>
                        </h1>
                        <p className="text-champagne/60 text-lg max-w-2xl leading-relaxed">
                            We're glad to have you here. This is your personal hub to access all elite membership benefits
                            and manage your experience with Kind Craft.
                        </p>
                    </motion.div>

                    {/* Featured Perk / Announcement */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gold/5 backdrop-blur-sm border border-gold/20 rounded-[2rem] group-hover:border-gold/40 transition-colors" />
                        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 shrink-0">
                                <Sparkles className="w-10 h-10 text-gold" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-serif font-bold text-champagne mb-2">Exclusive Member Benefit</h3>
                                <p className="text-champagne/70 mb-0">
                                    You have unlocked 20% flat discount on all premium matrimony plans for this month.
                                    Start exploring your perfect match today!
                                </p>
                            </div>
                            <Button asChild className="gold-gradient text-emerald-950 font-black px-8 h-12 rounded-xl group-hover:scale-105 transition-transform">
                                <Link to="/matrimony">Explore Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Dashboard Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 3) }}
                            >
                                <Link to={card.link} className="block h-full group">
                                    <div className={`h-full bg-gradient-to-br ${card.color} border border-white/5 rounded-3xl p-6 hover:border-gold/40 transition-all hover:translate-y-[-4px] overflow-hidden relative`}>
                                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <card.icon size={120} />
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-gold/10 group-hover:border-gold/20 transition-colors">
                                            <card.icon className="w-6 h-6 text-gold" />
                                        </div>
                                        <h3 className="text-xl font-serif font-bold text-champagne mb-3">{card.title}</h3>
                                        <p className="text-champagne/50 text-sm leading-relaxed mb-0">
                                            {card.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Stats / Account Status */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-80" />
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Account Status</p>
                                <p className="text-emerald-400 font-bold">Verified & Active</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                            <Layout className="w-8 h-8 text-blue-400 opacity-80" />
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Member Type</p>
                                <p className="text-blue-400 font-bold">Premium Tier</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                            <Settings className="w-8 h-8 text-gold/60 opacity-80" />
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Account ID</p>
                                <p className="text-gold/80 font-mono text-sm">{user?.id.substring(0, 8)}...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default MemberDashboard;
