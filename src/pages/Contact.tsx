import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Clock, MessageCircle, Sparkles, Instagram, Facebook, Twitter, Globe, ArrowRight } from "lucide-react";
import SocialMediaSection from "@/components/home/SocialMediaSection";

const contactDetails = [
  {
    icon: Phone,
    label: "Phone Support",
    values: ["+91 98408 26683", "+91 81247 20549"],
    subtext: "Multiple lines available 24/7",
    color: "emerald"
  },
  {
    icon: MessageCircle,
    label: "WhatsApp Chat",
    values: ["+91 74180 94867", "+91 95148 79417"],
    subtext: "Instant response for your queries",
    color: "emerald",
    isWhatsApp: true
  },
  {
    icon: Mail,
    label: "Official Email",
    values: ["pandiansekar880@gmail.com"],
    subtext: "Typical response within 2 hours",
    color: "amber"
  },
  {
    icon: MapPin,
    label: "Our Location",
    values: ["S. P. GEM GOLD ACADEMY", "No: 147/282, R. K. MUTT ROAD", "R. A. PURAM, CHENNAI - 600028"],
    subtext: "Visit our luxury hub",
    color: "amber"
  }
];

const Contact = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <MainLayout>
      {/* Minimalist Professional Hero Section */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden bg-charcoal">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_hsl(var(--primary)_/_0.15),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_hsl(var(--gold)_/_0.05),_transparent_40%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-gold/10 text-gold border-gold/20 backdrop-blur-sm px-6 py-1 rounded-full uppercase tracking-[0.2em] text-[10px] font-black">
                Connect With Excellence
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-serif font-bold text-champagne mb-8 leading-tight tracking-tight"
            >
              How can we <span className="text-gold-gradient italic">help you?</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-champagne/60 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
            >
              At S. P. GEM GOLD ACADEMY, every inquiry is handled with the utmost care.
              Discover our legacy of trust and craftsmanship.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Clean Contact Cards Grid */}
      <section className="py-24 -mt-16 relative z-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {contactDetails.map((detail, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="group bg-background border border-border/50 hover:border-gold/30 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center h-full"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${detail.color === 'emerald'
                  ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                  : 'bg-gold/5 text-gold group-hover:bg-gold group-hover:text-primary-foreground'
                  }`}>
                  <detail.icon className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-serif font-bold text-foreground mb-4 tracking-tight">{detail.label}</h3>

                <div className="flex-1 space-y-1 mb-6">
                  {detail.values.map((val, i) => (
                    <p key={i} className="text-muted-foreground text-sm font-medium">{val}</p>
                  ))}
                </div>

                <div className="mt-auto w-full pt-6 border-t border-border/5">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-4">
                    {detail.subtext}
                  </p>

                  {detail.isWhatsApp ? (
                    <a
                      href={`https://wa.me/919514879417`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs hover:underline group/link"
                    >
                      Instant Chat <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <div className="flex justify-center gap-4 text-muted-foreground/30">
                      <Instagram className="w-3.5 h-3.5 hover:text-gold transition-colors cursor-pointer" />
                      <Facebook className="w-3.5 h-3.5 hover:text-gold transition-colors cursor-pointer" />
                      <Twitter className="w-3.5 h-3.5 hover:text-gold transition-colors cursor-pointer" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SocialMediaSection />

      {/* Simplified Luxury Presence Section */}
      <section className="pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden border border-border bg-muted/30 h-[400px] relative group flex items-center justify-center p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0l40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E")` }} />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6"
              >
                <MapPin className="w-8 h-8 text-gold" />
              </motion.div>
              <h3 className="text-3xl font-serif font-bold text-foreground tracking-tight">Chennai Luxury Hub</h3>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                Connect with us at our flagship discovery center. Experience a legacy of craftsmanship
                designed for the modern era.
              </p>
              <div className="mt-8 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50">
                <p className="text-xs font-bold text-foreground">R. A. PURAM, CHENNAI - 600028</p>
              </div>
              <button
                onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=R.A.+Puram+Chennai', '_blank')}
                className="mt-8 flex items-center gap-2 text-gold font-bold text-sm hover:underline"
              >
                View on Google Maps <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute hidden lg:block bottom-12 right-12 text-right">
              <div className="w-12 h-0.5 gold-gradient mb-4 ml-auto" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Heritage Excellence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimalism Quote Section */}
      <section className="py-20 border-t border-border/50 text-center relative bg-background">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Sparkles className="w-6 h-6 text-gold/20 mx-auto mb-8" />
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 italic tracking-tight">
              Crafting Trust Since 1974
            </h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black">
              S. P. GEM GOLD ACADEMY PRIDE
            </p>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
