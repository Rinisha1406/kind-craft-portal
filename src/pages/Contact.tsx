import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Sparkles, Instagram, Facebook, Twitter, Globe } from "lucide-react";
import { z } from "zod";
import contactHero from "@/assets/contact-hero.png";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const contactInfo = [
  { icon: Phone, label: "Call Us", value: "+91 98765 43210", subtext: "Mon-Sat, 10AM-8PM" },
  { icon: MapPin, label: "Visit Us", value: "123 Jewelry Street", subtext: "Mumbai, Maharashtra 400001" },
  { icon: Clock, label: "Working Hours", value: "10:00 AM - 8:00 PM", subtext: "Monday to Saturday" },
];


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = contactSchema.parse(formData);
      setSubmitting(true);

      const { error } = await supabase.from("contact_messages").insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        subject: validated.subject || null,
        message: validated.message,
      });

      if (error) throw error;

      // 2. Sync with PHP/MySQL Database
      await fetch('http://localhost/kind-craft-portal/api/contact_messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated)
      });

      toast({
        title: "Message Sent! ✨",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Background Image with Parallax effect simulation */}
        <div className="absolute inset-0 z-0">
          <img src={contactHero} alt="Contact Us" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white" />
          {/* SVG Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-md text-gold border border-white/20 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-2xl"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Exquisite Support
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-sans font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl"
            >
              Let's craft <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Something Beautiful</span>
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 -mt-32 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto items-start">
            {/* Form Side */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="bg-white/90 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] border border-white/50 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                {/* Internal decorative blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-1000" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-tr from-emerald-600 to-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <Send className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="text-center md:text-left">
                      <h3 className="text-5xl font-sans font-black text-zinc-900 tracking-tighter mb-2">Send a Message</h3>
                      <p className="text-xl text-zinc-500 font-medium">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <motion.div className="space-y-3" variants={fadeInUp}>
                        <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-2">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                          className="h-16 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 transition-all text-lg px-6"
                        />
                      </motion.div>
                      <motion.div className="space-y-3" variants={fadeInUp}>
                        <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-2">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                          className="h-16 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 transition-all text-lg px-6"
                        />
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <motion.div className="space-y-3" variants={fadeInUp}>
                        <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-2">Phone *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          required
                          className="h-16 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 transition-all text-lg px-6"
                        />
                      </motion.div>
                      <motion.div className="space-y-3" variants={fadeInUp}>
                        <Label htmlFor="subject" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-2">Subject</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="How can we help?"
                          className="h-16 rounded-2xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 transition-all text-lg px-6"
                        />
                      </motion.div>
                    </div>

                    <motion.div className="space-y-3" variants={fadeInUp}>
                      <Label htmlFor="message" className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-2">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your inquiry..."
                        rows={6}
                        required
                        className="rounded-2xl bg-zinc-50/50 border-zinc-200 focus:border-emerald-500 transition-all text-lg p-6 resize-none"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-4"
                    >
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-20 bg-gradient-to-tr from-emerald-600 to-amber-500 text-white hover:opacity-95 px-12 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 transition-all"
                      >
                        {submitting ? "Sending..." : (
                          <>
                            Send Message
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>


            {/* Contact Info Side */}
            <motion.div
              className="lg:col-span-5 space-y-8"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 gap-6">
                {/* Contact Card 1 */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl group hover:-translate-y-2 transition-all duration-500 flex items-center gap-8">
                  <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:rotate-12 transition-all duration-500">
                    <Phone className="w-8 h-8 text-emerald-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-zinc-900 tracking-tighter">Support Line</h4>
                    <p className="text-zinc-500 font-bold">+91 98765 43210</p>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Available 24/7</p>
                  </div>
                </div>
                {/* Contact Card 2 */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl group hover:-translate-y-2 transition-all duration-500 flex items-center gap-8">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:rotate-12 transition-all duration-500">
                    <Mail className="w-8 h-8 text-amber-500 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-zinc-900 tracking-tighter">Direct Email</h4>
                    <p className="text-zinc-500 font-bold">hello@kindcraft.com</p>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Typical response: 2h</p>
                  </div>
                </div>
                {/* Contact Card 3 */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl group hover:-translate-y-2 transition-all duration-500 flex items-center gap-8">
                  <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:rotate-12 transition-all duration-500">
                    <MapPin className="w-8 h-8 text-emerald-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-zinc-900 tracking-tighter">Visit Gallery</h4>
                    <p className="text-zinc-500 font-bold">Mumbai, Maharashtra</p>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Global Presence</p>
                  </div>
                </div>
              </div>

              {/* Status Hub (Redesigned Map Placeholder) */}
              <div className="relative h-[450px] rounded-[3.5rem] overflow-hidden border border-zinc-200 shadow-2xl group flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-emerald-50/50" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

                <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl border border-zinc-100 flex items-center justify-center mb-8 group-hover:rotate-6 transition-all duration-700"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                      <Globe className="w-8 h-8 text-emerald-600 relative z-10" />
                    </div>
                  </motion.div>

                  <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-600 bg-emerald-50/50 px-4 py-1 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">
                    Global Headquarters
                  </Badge>

                  <h3 className="text-4xl font-sans font-black text-zinc-900 tracking-tighter mb-4 leading-none">
                    Mumbai <span className="text-emerald-600">Luxury Hub</span>
                  </h3>

                  <p className="text-zinc-500 font-bold max-w-[280px] leading-relaxed">
                    10th Floor, Marina Tower,<br />
                    Nariman Point, Mumbai 400021
                  </p>
                </div>

                <div className="bg-white border-t border-zinc-100 p-8 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-widest">Systems Active</span>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-zinc-200 font-bold hover:bg-zinc-50"
                    onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Nariman+Point+Mumbai', '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
