import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Star, Award, Sparkles, Gift, Percent, Users, Calendar, ArrowRight } from "lucide-react";
import { z } from "zod";

const membershipPlans = [
  {
    name: "Basic",
    price: "Free",
    priceValue: 0,
    icon: Star,
    color: "from-silver to-platinum",
    features: ["Browse all products", "View matrimony profiles", "Community access", "Newsletter updates"],
    popular: false,
  },
  {
    name: "Premium",
    price: "₹999",
    period: "/year",
    priceValue: 999,
    icon: Crown,
    color: "from-gold to-gold-dark",
    features: ["All Basic features", "Priority matrimony listing", "10% discount on products", "Dedicated support", "Exclusive events access", "Early collection previews"],
    popular: true,
  },
  {
    name: "Elite",
    price: "₹2,499",
    period: "/year",
    priceValue: 2499,
    icon: Award,
    color: "from-rose-gold to-accent",
    features: ["All Premium features", "20% discount on products", "Personal matchmaking", "VIP event access", "Free home delivery", "Custom jewelry orders", "Priority support 24/7"],
    popular: false,
  },
];

const benefits = [
  { icon: Percent, title: "Exclusive Discounts", desc: "Up to 20% off on all purchases" },
  { icon: Gift, title: "Special Gifts", desc: "Birthday & anniversary surprises" },
  { icon: Calendar, title: "VIP Events", desc: "Invitation to exclusive showcases" },
  { icon: Users, title: "Priority Matching", desc: "Featured matrimony profiles" },
];

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15).optional(),
});

const Members = () => {
  const [selectedPlan, setSelectedPlan] = useState("Premium");
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = registrationSchema.parse(formData);
      setSubmitting(true);

      const { error } = await supabase.from("registrations").insert({
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone || null,
        registration_type: "member",
      });

      if (error) throw error;

      toast({
        title: "Welcome to the Family! 🎉",
        description: `You've registered for ${selectedPlan} membership. We'll contact you soon.`,
      });
      setFormData({ fullName: "", email: "", phone: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to submit registration.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_hsl(38_70%_45%_/_0.1),_transparent_50%)]" />
        
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
              <Crown className="w-4 h-4" />
              Exclusive Membership
            </motion.span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
              Join Our
              <span className="text-gold-gradient block">Elite Community</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Become a member and unlock exclusive benefits, premium discounts, and personalized services 
              that make every moment special.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div 
                  className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">Select the membership that suits your needs</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 ${
                  selectedPlan === plan.name
                    ? "border-primary shadow-gold bg-card scale-105 z-10"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 gold-gradient text-primary-foreground text-sm font-medium rounded-full shadow-gold"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </motion.div>
                )}
                
                <div className="text-center mb-8">
                  <motion.div 
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br ${plan.color} shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <plan.icon className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-3">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${selectedPlan === plan.name ? "gold-gradient text-primary-foreground shadow-gold" : ""}`}
                  variant={selectedPlan === plan.name ? "default" : "outline"}
                >
                  {selectedPlan === plan.name ? "Selected" : "Select Plan"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-24 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(38_70%_45%_/_0.1),_transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-lg mx-auto">
            <motion.div 
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Crown className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-4xl font-serif font-bold text-champagne mb-2">Complete Registration</h2>
              <p className="text-champagne/70">
                Selected: <span className="text-gold font-semibold">{selectedPlan} Membership</span>
              </p>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className="bg-card p-10 rounded-3xl shadow-gold border border-gold/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="h-14 rounded-xl border-border focus:border-primary text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    className="h-14 rounded-xl border-border focus:border-primary text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="h-14 rounded-xl border-border focus:border-primary text-base"
                  />
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-8">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 gold-gradient text-primary-foreground shadow-gold text-lg font-semibold rounded-xl"
                >
                  {submitting ? "Processing..." : (
                    <>
                      Complete Registration
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
              
              <p className="text-center text-sm text-muted-foreground mt-6">
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>
            </motion.form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Members;
