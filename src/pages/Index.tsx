import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Gem, Heart, Users, Star, Shield, Award, Sparkles, Quote, Crown, Search, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import heroImage from "@/assets/hero-jewelry.jpg";
import collectionGold from "@/assets/collection-gold.png";
import collectionDiamond from "@/assets/collection-diamond.png";
import collectionPlatinum from "@/assets/collection-platinum.png";
import goldAppraiserCourse from "@/assets/gold-appraiser-course.png";
import SocialMediaSection from "@/components/home/SocialMediaSection";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const Counter = ({ value, label }: { value: string; label: string }) => {
  return (
    <motion.div
      className="text-center p-4 bg-charcoal/50 backdrop-blur-md rounded-xl border border-gold/20"
      whileHover={{ scale: 1.05, borderColor: "hsl(38, 70%, 45%)" }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <div className="text-3xl font-bold text-gold">
        {value}
      </div>
      <div className="text-xs text-champagne/70">{label}</div>
    </motion.div>
  );
};

const features = [
  {
    icon: Gem,
    title: "Premium Jewelry",
    description: "Exquisite gold, silver, diamond, and platinum collections crafted with perfection by master artisans.",
  },
  {
    icon: Heart,
    title: "Matrimony Services",
    description: "Find your perfect life partner within our trusted community network with personalized matchmaking.",
  },
  {
    icon: Users,
    title: "Exclusive Community",
    description: "Join our growing family of members and enjoy exclusive benefits, events, and lifetime privileges.",
  },
  {
    icon: Shield,
    title: "Certified Quality",
    description: "Every piece comes with hallmark certification and lifetime exchange guarantee.",
  },
];

const stats = [
  { number: "48+", label: "Years of Legacy" },
  { number: "9K+", label: "Happy Families" },
  { number: "483+", label: "Successful Matches" },
  { number: "97%", label: "Certified Gold" },
];

const testimonials = [
  {
    name: "Meera & Arjun Sharma",
    text: "S. P. GEM GOLD ACADEMY helped us find each other through their matrimony service. The jewelry for our wedding was absolutely stunning!",
    role: "Married in 2023",
  },
  {
    name: "Priyanka Patel",
    text: "The craftsmanship of their bridal set exceeded all expectations. It's been in my family for generations now.",
    role: "Member since 2015",
  },
  {
    name: "Rajesh & Sunita Mehta",
    text: "Exceptional service and quality. The team made our daughter's wedding truly memorable with their exquisite collection.",
    role: "Loyal Customers",
  },
];

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <motion.img
            src={heroImage}
            alt="Luxury Jewelry"
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          />
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

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            className="max-w-2xl"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm text-gold border border-gold/30 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Celebrating 48 Years of Excellence
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-champagne mb-6 leading-tight"
            >
              Where Tradition
              <span className="block text-gold-gradient">Meets Elegance</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-champagne/80 mb-8 max-w-xl leading-relaxed"
            >
              Discover our legacy of exquisite jewelry collections and connect with our vibrant
              community through trusted matrimony and membership services.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold hover:scale-105 transition-transform text-base px-8 animate-pulse-gold">
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/matrimony">
                <Button size="lg" variant="outline" className="bg-transparent border-champagne/50 text-champagne hover:bg-champagne/10 backdrop-blur-sm text-base px-8">
                  <Heart className="mr-2 w-5 h-5" />
                  Matrimony Services
                </Button>
              </Link>
            </motion.div>

            {/* Floating Stats */}
            {/* Floating Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Counter key={stat.label} value={stat.number} label={stat.label} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[200px] opacity-10" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From stunning jewelry to meaningful connections - we're here for every milestone in your life.
            </p>
          </motion.div>

          <motion.div
            className="standard-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group small-card"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <motion.div
                    className="w-20 h-20 gold-gradient rounded-2xl flex items-center justify-center shadow-gold relative z-10"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <feature.icon className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-serif font-semibold text-foreground mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 h-8 mb-3">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">
                      Enquire Now
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center relative overflow-hidden group/btn border border-emerald-400/20"
                      onClick={() => {
                        const phoneNumber = "919514879417";
                        const message = encodeURIComponent(`Hi, I'm interested in your ${feature.title} service. Could you please provide more information?`);
                        window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
                      }}
                      title="Enquire on WhatsApp"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                      <MessageCircle className="w-4 h-4 relative z-10" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Curated Excellence
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Featured Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our most sought-after categories, crafted to perfection.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { title: "Royal Gold", image: collectionGold, desc: "Timeless traditional designs", link: "gold" },
              { title: "Forever Diamond", image: collectionDiamond, desc: "Brilliance that never fades", link: "diamond" },
              { title: "Modern Platinum", image: collectionPlatinum, desc: "Contemporary elegance", link: "platinum" },
            ].map((collection, index) => (
              <motion.div
                key={collection.title}
                className="group relative h-[300px] small-card cursor-pointer"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-center transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-xl font-serif font-bold text-white mb-1">{collection.title}</h3>
                  <p className="text-white/80 text-xs mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {collection.desc}
                  </p>
                  <Link to={`/products?category=${collection.link}`}>
                    <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      View Collection
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section >

      {/* Gold Appraiser Course Featured Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-gold/20 border border-gold/20 group">
                <img
                  src={goldAppraiserCourse}
                  alt="Gold Appraiser Course"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60" />

                {/* Floating Badge */}
                <motion.div
                  className="absolute top-6 left-6 bg-gold text-primary-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Award className="w-4 h-4" />
                  Professional Certification
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 gold-gradient rounded-full blur-3xl opacity-20 -z-10 animate-pulse" />
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-10 -z-10 animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New Education Program
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                Master the Art of <span className="text-gold-gradient">Gold Appraisal</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Unlock a rewarding career in the jewelry industry with our comprehensive Professional Gold Appraiser Course. Learn valuation, purity testing, and authentication from industry experts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {[
                  { title: "Authentication", desc: "Digital & Acid testing methods" },
                  { title: "Market Valuation", desc: "Live market rate calculator" },
                  { title: "Net Weight Calc", desc: "Precision stone deduction" },
                  { title: "Certification", desc: "Professional trade license" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-muted-foreground text-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-12 px-8 flex items-center justify-center gap-2 border border-emerald-500/30 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                  onClick={() => {
                    const phoneNumber = "919876543210";
                    const message = encodeURIComponent("Hi, I'm interested in the Gold Appraiser Course. Could you please provide more details?");
                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Enquire Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      < section className="py-12 bg-charcoal relative overflow-hidden" >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(38_70%_45%_/_0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(15_50%_55%_/_0.1),_transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-gold/20 text-gold rounded-full text-sm font-medium mb-6">
                Why Choose Us
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-champagne mb-6">
                A Legacy of Trust & Excellence
              </h2>
              <p className="text-champagne/70 text-lg mb-8 leading-relaxed">
                For over five decades, S. P. GEM GOLD ACADEMY has been the cornerstone of our community,
                providing exceptional jewelry and fostering meaningful connections through our
                matrimony services.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Award, title: "Master Craftsmen", desc: "Jewelry crafted by 3rd generation artisans" },
                  { icon: Shield, title: "100% Certified", desc: "BIS hallmark on every gold piece" },
                  { icon: Star, title: "Lifetime Exchange", desc: "Exchange old jewelry at full value" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex items-start gap-4 p-4 bg-charcoal/50 border border-gold/20 rounded-xl"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 10, borderColor: "hsl(38, 70%, 45%)" }}
                  >
                    <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-champagne font-semibold mb-1">{item.title}</h4>
                      <p className="text-champagne/60 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                <div className="absolute inset-0 gold-gradient opacity-20" />
                <div className="absolute inset-4 border-2 border-gold/30 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 gold-gradient rounded-full flex items-center justify-center shadow-gold"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Gem className="w-16 h-16 text-primary-foreground" />
                  </motion.div>
                </div>

                {/* Floating elements */}
                <motion.div
                  className="absolute top-10 left-10 w-20 h-20 bg-gold/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-gold/20"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-gold" />
                </motion.div>
                <motion.div
                  className="absolute bottom-10 right-10 w-20 h-20 bg-rose-gold/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-rose-gold/20"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 text-rose-gold" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section >

      {/* Matrimony Process Section */}
      <section className="py-12 relative overflow-hidden bg-charcoal">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-gold/10 rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-rose-gold/10 to-gold/10 text-rose-gold border border-rose-gold/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Heart className="w-3 h-3 inline mr-2 text-rose-gold" />
              Find Your Match
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-champagne mb-6">
              Your Journey to <span className="text-gold-gradient">Forever</span>
            </h2>
            <p className="text-champagne/60 max-w-2xl mx-auto text-lg leading-relaxed">
              Experience a matrimony service designed for modern families who value tradition.
              Three simple steps to find your perfect life partner.
            </p>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-8 mb-16">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold/20 to-transparent -translate-y-1/2" />

            {[
              {
                icon: Users,
                title: "Create Profile",
                desc: "Join our exclusive community with a comprehensive profile that highlights your values.",
                step: "01"
              },
              {
                icon: Search,
                title: "Find Matches",
                desc: "Browse through verified profiles curated to match your preferences and background.",
                step: "02"
              },
              {
                icon: MessageCircle,
                title: "Connect & Meet",
                desc: "Start meaningful conversations and meet families with our secured coordination.",
                step: "03"
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-gold/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                {/* Step Number Watermark */}
                <div className="absolute top-4 right-6 text-6xl font-serif font-bold text-white/5 select-none group-hover:text-gold/10 transition-colors duration-500">
                  {item.step}
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/20">
                    <item.icon className="w-8 h-8 text-gold group-hover:text-rose-gold transition-colors duration-500" />
                  </div>

                  <h3 className="text-2xl font-serif font-semibold text-champagne mb-4 group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-champagne/60 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gold/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/matrimony">
              <Button size="lg" className="h-14 px-10 text-lg gold-gradient text-primary-foreground shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-105 transition-all duration-300 rounded-full">
                Begin Your Story
                <Heart className="ml-2 w-5 h-5 fill-current" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SocialMediaSection />

      {/* Testimonials */}
      < section className="py-12 relative" >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              What Our Families Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                className="p-6 small-card relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gold-gradient rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-primary">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-12 bg-charcoal relative overflow-hidden" >
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, hsl(38 70% 45% / 0.15), transparent 50%)",
              "radial-gradient(circle at 80% 50%, hsl(38 70% 45% / 0.15), transparent 50%)",
              "radial-gradient(circle at 20% 50%, hsl(38 70% 45% / 0.15), transparent 50%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-champagne mb-6">
              Begin Your Journey With Us
            </h2>
            <p className="text-champagne/70 max-w-2xl mx-auto mb-10 text-lg">
              Join our exclusive community and unlock premium access to our collections,
              personalized services, and special events.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/members">
                <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold hover:scale-105 transition-transform px-10">
                  Become a Member
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-champagne/30 text-champagne hover:bg-champagne/10 px-10">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section >
    </MainLayout >
  );
};

export default Index;
