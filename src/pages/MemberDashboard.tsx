import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
    ArrowRight,
    LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MemberDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const cards = [
        {
            title: "My Profile",
            description: "Manage your personal details and address information",
            icon: User,
            link: "/member/profile",
            color: "from-gold/20 to-gold/5"
        },
        {
            title: "Manage Services",
            description: "List and manage the professional services you offer",
            icon: Briefcase,
            link: "/member/manage-services",
            color: "from-orange-500/20 to-orange-500/5"
        },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 text-gold mb-4">
                                <Crown className="w-6 h-6" />
                                <span className="font-serif font-bold uppercase tracking-widest text-sm">Premium Member Dashboard</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-champagne mb-4">
                                Welcome Back
                            </h1>
                            <p className="text-champagne/60 text-lg max-w-2xl leading-relaxed">
                                We're glad to have you here. This is your personal hub to access all elite membership benefits
                                and manage your experience with Kind Craft.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                signOut();
                                navigate("/members");
                            }}
                            className="border-gold/30 text-gold hover:bg-gold/10 gap-2 shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
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


                </div>
            </div>
        </MainLayout>
    );
};

export default MemberDashboard;
