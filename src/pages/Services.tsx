import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gem, Heart, Users, PenTool, RefreshCw, ArrowRight, ShieldCheck, Sparkles, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import heroImage from "@/assets/services-hero.png";
import ringImage from "@/assets/ring.jpg";
import matrimonyImage from "@/assets/matrimonial-service.jpg";
import astrologyImage from "@/assets/astrology-service.jpg";

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const Services = () => {
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img src={heroImage} alt="Services Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
                </div>

                {/* Animated decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-20 right-20 w-64 h-64 gold-gradient rounded-full blur-3xl opacity-20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute bottom-32 right-1/3 w-48 h-48 bg-rose-gold rounded-full blur-3xl opacity-20"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.25, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        className="max-w-3xl"
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        <motion.span
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm text-gold border border-gold/30 rounded-full text-sm font-medium mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            Excellence in Every Detail
                        </motion.span>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-champagne mb-6 leading-tight"
                        >
                            Our Premium <span className="block text-gold-gradient">Services</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-champagne/80 mb-8 max-w-2xl leading-relaxed"
                        >
                            Beyond exquisite jewelry, we offer a suite of services designed to celebrate your life's most cherished moments, from finding your soulmate to preserving your family's legacy.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Main Services List */}
            <section className="py-20 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="grid gap-16"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {/* Service 1: Jewelry Collections */}
                        <motion.div variants={fadeInUp} className="group grid md:grid-cols-2 gap-8 items-center bg-card/30 rounded-3xl p-8 border border-border/50 hover:border-gold/30 transition-all duration-500">
                            <div className="order-2 md:order-1 space-y-6">
                                <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center shadow-gold">
                                    <Gem className="w-8 h-8 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-foreground">Exquisite Jewelry Collections</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Discover our curated selection of Gold, Diamond, and Platinum jewelry. Each piece is a masterpiece, crafted with precision and passion to adorn your special moments.
                                </p>
                                <ul className="space-y-3">
                                    {['BIS Hallmarked Gold', 'Certified Diamonds', 'Platinum Guild Authorized'].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-foreground/80">
                                            <ShieldCheck className="w-5 h-5 text-gold" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/products">
                                    <Button className="mt-4 gold-gradient text-primary-foreground">
                                        View Collections <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="order-1 md:order-2 h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent mix-blend-overlay z-10" />
                                <img
                                    src={ringImage}
                                    alt="Exquisite Jewelry Ring"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </motion.div>

                        {/* Service 2: Matrimony */}
                        <motion.div variants={fadeInUp} className="group grid md:grid-cols-2 gap-8 items-center bg-card/30 rounded-3xl p-8 border border-border/50 hover:border-gold/30 transition-all duration-500">
                            <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-gold/20 to-transparent mix-blend-overlay z-10" />
                                <img
                                    src={matrimonyImage}
                                    alt="Trusted Matrimony Services"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-gold to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-900/20">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-foreground">Trusted Matrimony Services</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    We bring families together. Our personalized matchmaking service respects tradition while embracing modern compatibility, helping you find your perfect life partner.
                                </p>
                                <ul className="space-y-3">
                                    {['Verified Profiles', 'Privacy Protected', 'Personalized Assistance'].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-foreground/80">
                                            <ShieldCheck className="w-5 h-5 text-rose-gold" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/matrimony">
                                    <Button variant="outline" className="mt-4 border-rose-gold/50 text-rose-gold hover:bg-rose-gold/10">
                                        Find Your Match <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>


                        {/* Service 3: Astrology */}
                        <motion.div variants={fadeInUp} className="group grid md:grid-cols-2 gap-8 items-center bg-card/30 rounded-3xl p-8 border border-border/50 hover:border-gold/30 transition-all duration-500">
                            <div className="order-2 md:order-1 space-y-6">
                                <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center shadow-gold">
                                    <Moon className="w-8 h-8 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-foreground">Astrology & Horoscope</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Align your stars for a blissful future. Our expert astrologers provide comprehensive horoscope matching and consultation services to ensure cosmic harmony in your relationships.
                                </p>
                                <ul className="space-y-3">
                                    {['Horoscope Matching', 'Kundli Generation', 'Dosha Nivarana'].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-foreground/80">
                                            <Sparkles className="w-5 h-5 text-gold" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/contact">
                                    <Button className="mt-4 gold-gradient text-primary-foreground">
                                        Book Consultation <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <div className="order-1 md:order-2 h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent mix-blend-overlay z-10" />
                                <img
                                    src={astrologyImage}
                                    alt="Astrology Services"
                                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </motion.div>

                        {/* Service 4: Custom Design & Membership */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <motion.div variants={fadeInUp} className="bg-card p-8 rounded-2xl border border-border hover:border-gold/30 transition-all hover:-translate-y-1">
                                <PenTool className="w-12 h-12 text-gold mb-6" />
                                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Bespoke Custom Design</h3>
                                <p className="text-muted-foreground mb-6">
                                    Have a dream design in mind? Our master artisans can bring your vision to life. From engagement rings to heirloom remodeling, we create jewelry that is uniquely yours.
                                </p>
                                <Button variant="link" className="text-gold p-0 h-auto font-semibold">
                                    Book Consultation <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="bg-card p-8 rounded-2xl border border-border hover:border-gold/30 transition-all hover:-translate-y-1">
                                <Users className="w-12 h-12 text-gold mb-6" />
                                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Elite Membership</h3>
                                <p className="text-muted-foreground mb-6">
                                    Join our exclusive circle for special privileges, early access to new collections, birthday rewards, and lifetime maintenance services for your jewelry.
                                </p>
                                <Link to="/members">
                                    <Button variant="link" className="text-gold p-0 h-auto font-semibold">
                                        View Benefits <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Service 4: Gold Exchange */}
                        <motion.div variants={fadeInUp} className="bg-gradient-to-r from-charcoal to-black p-8 md:p-12 rounded-3xl border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-gold/10 rounded-full">
                                        <RefreshCw className="w-8 h-8 text-gold" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-champagne">Gold Exchange Program</h3>
                                </div>
                                <p className="text-champagne/70 max-w-xl">
                                    Upgrade your old gold jewelry for brand new designs. We offer the best exchange rates and 100% value on gold weight for your old jewelry.
                                </p>
                            </div>
                            <Link to="/contact">
                                <Button size="lg" className="bg-white text-black hover:bg-gray-200 min-w-[150px]">
                                    Inquire Now
                                </Button>
                            </Link>
                        </motion.div>

                    </motion.div>
                </div>
            </section>
        </MainLayout>
    );
};

export default Services;
