import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, MapPin, Briefcase, GraduationCap, Heart, Sparkles, Users, Shield, CheckCircle } from "lucide-react";
import { z } from "zod";
import matrimonyHero from "@/assets/matrimony-hero.jpg";

interface MatrimonyProfile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  occupation: string | null;
  education: string | null;
  location: string | null;
  bio: string | null;
  image_url: string | null;
}

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15).optional(),
});

const features = [
  { icon: Shield, title: "Verified Profiles", desc: "All profiles are manually verified for authenticity" },
  { icon: Users, title: "Community Based", desc: "Connect within our trusted community network" },
  { icon: Heart, title: "Personalized Matching", desc: "Our experts help find your perfect match" },
  { icon: CheckCircle, title: "Success Stories", desc: "500+ happy couples and counting" },
];

const Matrimony = () => {
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("matrimony_profiles")
        .select("id, full_name, age, gender, occupation, education, location, bio, image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = registrationSchema.parse(formData);
      setSubmitting(true);

      const { error } = await supabase.from("registrations").insert({
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone || null,
        registration_type: "matrimony",
      });

      if (error) throw error;

      toast({
        title: "Registration Successful! 🎉",
        description: "Our team will contact you within 24 hours.",
      });
      setRegisterOpen(false);
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

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === "all" || profile.gender.toLowerCase() === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={matrimonyHero} alt="Happy Couple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/80 to-charcoal/60" />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-gold/20 text-rose-gold border border-rose-gold/30 rounded-full text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Heart className="w-4 h-4" />
              Find Your Soulmate
            </motion.span>
            
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-champagne mb-6 leading-tight">
              Where Hearts
              <span className="text-gold-gradient block">Find Home</span>
            </h1>
            
            <p className="text-lg text-champagne/80 mb-8 leading-relaxed">
              Join our trusted community of families seeking meaningful connections. 
              Let us help you find your perfect life partner with our personalized matchmaking services.
            </p>
            
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold animate-pulse-gold">
                    <UserPlus className="mr-2 w-5 h-5" />
                    Register for Matrimony
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                    <Heart className="w-6 h-6 text-rose-gold" />
                    Begin Your Journey
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRegister} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 gold-gradient text-primary-foreground" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div 
                  className="w-14 h-14 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or occupation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-full border-border focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              {["all", "male", "female"].map((gender) => (
                <motion.button
                  key={gender}
                  onClick={() => setGenderFilter(gender)}
                  className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                    genderFilter === gender
                      ? "gold-gradient text-primary-foreground shadow-gold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfiles.length > 0 ? (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" layout>
              {filteredProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-gold transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                    {profile.image_url ? (
                      <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <span className="text-8xl opacity-30">👤</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                      {profile.age} yrs • {profile.gender}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {profile.full_name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {profile.occupation && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4 text-primary" />
                          {profile.occupation}
                        </div>
                      )}
                      {profile.education && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          {profile.education}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          {profile.location}
                        </div>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-muted-foreground text-sm mb-5 line-clamp-2">{profile.bio}</p>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full gold-gradient text-primary-foreground shadow-gold">
                        <Heart className="w-4 h-4 mr-2" />
                        View Full Profile
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div 
                className="text-8xl mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💍
              </motion.div>
              <h3 className="text-3xl font-serif font-semibold text-foreground mb-4">No Profiles Found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm ? "Try adjusting your search criteria." : "Be the first to register and find your perfect match!"}
              </p>
              <Button onClick={() => setRegisterOpen(true)} className="gold-gradient text-primary-foreground">
                <UserPlus className="w-4 h-4 mr-2" />
                Register Now
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-charcoal to-charcoal/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(15_50%_55%_/_0.15),_transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-champagne mb-4">Ready to Find Your Match?</h2>
            <p className="text-champagne/70 max-w-xl mx-auto mb-8">
              Join thousands of families who found their perfect match through Golden Legacy's trusted matrimony services.
            </p>
            <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold hover:scale-105 transition-transform" onClick={() => setRegisterOpen(true)}>
              Start Your Journey Today
            </Button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Matrimony;
