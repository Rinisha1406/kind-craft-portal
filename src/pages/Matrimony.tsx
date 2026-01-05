import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import MatrimonyCard from "@/components/ui/matrimony-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus } from "lucide-react";
import { z } from "zod";

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

      const { error } = await supabase
        .from("registrations")
        .insert({
          full_name: validated.fullName,
          email: validated.email,
          phone: validated.phone || null,
          registration_type: "matrimony",
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: "We'll contact you soon with more details.",
      });
      setRegisterOpen(false);
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

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === "all" || profile.gender.toLowerCase() === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-secondary/50 to-rose-gold/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Matrimony Services
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Find your perfect life partner within our trusted community. Browse profiles and connect with compatible matches.
            </p>
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gold-gradient text-primary-foreground shadow-gold">
                  <UserPlus className="mr-2 w-5 h-5" />
                  Register for Matrimony
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Register for Matrimony</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or occupation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "male", "female"].map((gender) => (
                <Button
                  key={gender}
                  variant={genderFilter === gender ? "default" : "outline"}
                  onClick={() => setGenderFilter(gender)}
                  className={genderFilter === gender ? "gold-gradient text-primary-foreground" : ""}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <MatrimonyCard
                  key={profile.id}
                  fullName={profile.full_name}
                  age={profile.age}
                  gender={profile.gender}
                  occupation={profile.occupation || undefined}
                  education={profile.education || undefined}
                  location={profile.location || undefined}
                  bio={profile.bio || undefined}
                  imageUrl={profile.image_url || undefined}
                  onContact={() => toast({ title: "Contact Request", description: "Please register to view contact details." })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💍</div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                No Profiles Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search criteria." : "Check back soon for new profiles."}
              </p>
              <Button onClick={() => setRegisterOpen(true)} className="gold-gradient text-primary-foreground">
                Register Your Profile
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Matrimony;
