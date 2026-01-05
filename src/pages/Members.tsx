import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Star, Award } from "lucide-react";
import { z } from "zod";

const membershipPlans = [
  {
    name: "Basic",
    price: "Free",
    icon: Star,
    features: ["Browse all products", "View matrimony profiles", "Community access", "Newsletter updates"],
    popular: false,
  },
  {
    name: "Premium",
    price: "₹999/year",
    icon: Crown,
    features: ["All Basic features", "Priority matrimony listing", "10% discount on products", "Dedicated support", "Exclusive events access"],
    popular: true,
  },
  {
    name: "Elite",
    price: "₹2,499/year",
    icon: Award,
    features: ["All Premium features", "20% discount on products", "Personal matchmaking", "VIP event access", "Free home delivery", "Custom jewelry orders"],
    popular: false,
  },
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

      const { error } = await supabase
        .from("registrations")
        .insert({
          full_name: validated.fullName,
          email: validated.email,
          phone: validated.phone || null,
          registration_type: "member",
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: `You've registered for the ${selectedPlan} membership. We'll contact you soon.`,
      });
      setFormData({ fullName: "", email: "", phone: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit registration. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Become a Member
            </h1>
            <p className="text-muted-foreground text-lg">
              Join our exclusive community and unlock premium benefits, special discounts, and personalized services.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipPlans.map((plan) => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.name
                    ? "border-primary shadow-gold bg-card"
                    : "border-border hover:border-primary/50 bg-card"
                } ${plan.popular ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gold-gradient text-primary-foreground text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    selectedPlan === plan.name ? "gold-gradient" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-8 h-8 ${selectedPlan === plan.name ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary">{plan.price}</p>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-champagne mb-2">
                Register Now
              </h2>
              <p className="text-muted-foreground">
                Selected plan: <span className="text-gold font-semibold">{selectedPlan}</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-2xl shadow-soft">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  className="border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="border-border focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gold-gradient text-primary-foreground shadow-gold hover:opacity-90 text-lg py-6"
              >
                {submitting ? "Processing..." : "Complete Registration"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Members;
