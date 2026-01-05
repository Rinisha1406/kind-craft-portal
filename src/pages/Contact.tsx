import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Sparkles, Instagram, Facebook, Twitter } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(15).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const contactInfo = [
  { icon: Phone, label: "Call Us", value: "+91 98765 43210", subtext: "Mon-Sat, 10AM-8PM" },
  { icon: Mail, label: "Email Us", value: "info@goldenlegacy.com", subtext: "We reply within 24hrs" },
  { icon: MapPin, label: "Visit Us", value: "123 Jewelry Street", subtext: "Mumbai, Maharashtra 400001" },
  { icon: Clock, label: "Working Hours", value: "10:00 AM - 8:00 PM", subtext: "Monday to Saturday" },
];

const faqs = [
  { q: "Do you offer custom jewelry designs?", a: "Yes! Our master craftsmen can create bespoke pieces tailored to your vision." },
  { q: "What is your return policy?", a: "We offer lifetime exchange on all gold jewelry at current market rates." },
  { q: "How does matrimony registration work?", a: "Register online, and our team will contact you within 24 hours for verification." },
  { q: "Are your diamonds certified?", a: "All our diamonds come with IGI/GIA certification for authenticity." },
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = contactSchema.parse(formData);
      setSubmitting(true);

      const { error } = await supabase.from("contact_messages").insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        subject: validated.subject || null,
        message: validated.message,
      });

      if (error) throw error;

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
      <section className="py-24 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_hsl(38_70%_45%_/_0.1),_transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MessageCircle className="w-4 h-4" />
              Get in Touch
            </motion.span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
              We'd Love to
              <span className="text-gold-gradient block">Hear From You</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Have a question about our jewelry collections or services? We're here to help 
              and make your experience memorable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                className="bg-card p-6 rounded-2xl border border-border shadow-card hover:shadow-gold transition-all duration-500 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center mb-4 shadow-gold group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 5 }}
                >
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="font-semibold text-foreground mb-1">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.subtext}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-card p-10 rounded-3xl border border-border shadow-card">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center shadow-gold">
                    <Send className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">Send a Message</h3>
                    <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your inquiry..."
                      rows={5}
                      required
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-14 gold-gradient text-primary-foreground shadow-gold text-lg rounded-xl"
                    >
                      {submitting ? "Sending..." : (
                        <>
                          Send Message
                          <Send className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>

            {/* FAQs & Map */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* FAQs */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-serif font-bold text-foreground">Frequently Asked</h3>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <motion.div
                      key={i}
                      className="bg-card rounded-2xl border border-border overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full p-5 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-foreground pr-4">{faq.q}</span>
                        <motion.span
                          animate={{ rotate: expandedFaq === i ? 45 : 0 }}
                          className="text-primary text-2xl flex-shrink-0"
                        >
                          +
                        </motion.span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: expandedFaq === i ? "auto" : 0, opacity: expandedFaq === i ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-muted-foreground text-sm">{faq.a}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-card">
                <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
                  <div className="text-center">
                    <motion.div 
                      className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-gold"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <MapPin className="w-8 h-8 text-primary-foreground" />
                    </motion.div>
                    <p className="font-semibold text-foreground">Golden Legacy Showroom</p>
                    <p className="text-sm text-muted-foreground">Mumbai, Maharashtra</p>
                  </div>
                </div>
                <div className="p-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Follow us on social media</p>
                  <div className="flex gap-4">
                    {[Instagram, Facebook, Twitter].map((Icon, i) => (
                      <motion.a
                        key={i}
                        href="#"
                        className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:gold-gradient hover:text-primary-foreground transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
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
