import { motion } from "framer-motion";
import { Facebook, ExternalLink, MessageCircle, ThumbsUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const socialLinks = [
    {
        title: "Green Tree Ayush Care",
        url: "https://www.facebook.com/share/1DwwHr3wES/",
        description: "Holistic wellness and traditional care for a healthier lifestyle. Visit our page for regular health tips and herbal solutions.",
        date: "Official Page",
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        shadowColor: "shadow-emerald-500/20"
    },
    {
        title: "S.P Gems & Astrology",
        url: "https://www.facebook.com/share/1JfrjcyEzV/",
        description: "Expert astrological guidance and premium gemstone collections for your spiritual and material well-being.",
        date: "Official Page",
        iconColor: "text-gold",
        bgColor: "bg-gold/10",
        shadowColor: "shadow-gold/20"
    },
    {
        title: "Sekar Pandian",
        url: "https://www.facebook.com/share/17viyVcdjs/",
        description: "Connect with us for professional insights into the world of gold, gems, and traditional jewelry craftsmanship.",
        date: "Official Profile",
        iconColor: "text-gold",
        bgColor: "bg-gold/10",
        shadowColor: "shadow-gold/20"
    }
];

const SocialMediaSection = () => {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-gold/20"
                    >
                        <Facebook className="w-3.5 h-3.5" />
                        Social Presence
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6"
                    >
                        Connect With Us on <span className="text-gold">Facebook</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Follow our journey and stay connected with our community for real-time updates and exclusive content.
                    </motion.p>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                >
                    {socialLinks.map((link, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeInUp}
                            className="group bg-white rounded-[2.5rem] p-8 border border-border/50 hover:border-gold/30 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] relative overflow-hidden flex flex-col h-full shadow-sm"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${link.bgColor} rounded-bl-[5rem] -z-10 group-hover:scale-110 transition-transform`} />

                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-12 h-12 bg-charcoal rounded-2xl flex items-center justify-center shadow-lg ${link.shadowColor} group-hover:rotate-12 transition-transform border border-gold/20`}>
                                    <Facebook className={`w-6 h-6 ${link.iconColor}`} />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{link.date}</span>
                            </div>

                            <h3 className="text-xl font-serif font-bold text-foreground mb-4 group-hover:text-gold transition-colors">
                                {link.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">
                                {link.description}
                            </p>

                            <div className="flex items-center gap-6 mb-8 text-muted-foreground/40">
                                <div className="flex items-center gap-1.5 hover:text-gold cursor-pointer transition-colors">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span className="text-xs font-bold italic">Like</span>
                                </div>
                                <div className="flex items-center gap-1.5 hover:text-gold cursor-pointer transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold italic">Comment</span>
                                </div>
                                <div className="flex items-center gap-1.5 hover:text-gold cursor-pointer transition-colors">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-xs font-bold italic">Share</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full rounded-2xl border-gold/20 text-charcoal hover:bg-gold hover:text-white group/btn h-12 font-bold"
                                onClick={() => window.open(link.url, '_blank')}
                            >
                                View Post
                                <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <div className="p-8 md:p-12 bg-charcoal rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-gold/20 group border border-gold/10">
                        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">Never Miss an Update</h3>
                            <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg font-light">
                                Join our community on Facebook to engage with expert appraisers and jewelry enthusiasts worldwide.
                            </p>
                            <Button className="gold-gradient text-primary-foreground hover:scale-105 transition-transform rounded-full px-12 h-14 font-bold shadow-xl border-none">
                                Follow Official Page
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SocialMediaSection;
