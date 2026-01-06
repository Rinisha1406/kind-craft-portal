import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Search, UserPlus, MapPin, Briefcase, GraduationCap, Heart, Sparkles, Users, Shield, CheckCircle, Calendar } from "lucide-react";
import { z } from "zod";
import matrimonyHero from "@/assets/matrimony-hero.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

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
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15),
  fatherName: z.string().trim().min(2, "Father's name is required").optional(),
  motherName: z.string().trim().min(2, "Mother's name is required").optional(),
  salary: z.string().trim().optional(),
  city: z.string().trim().min(2, "City name is too short").optional(),
  caste: z.string().trim().optional(),
  community: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  dob: z.string().trim().optional(),
  gender: z.string().trim().optional(),
});

const RegistrationForm = ({ onClose, onSignInClick }: { onClose: () => void, onSignInClick?: () => void }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    fatherName: "",
    motherName: "",
    salary: "",
    city: "",
    caste: "",
    community: "",
    occupation: "",
    dob: "",
    gender: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { signUp, signIn } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = registrationSchema.parse(formData);
      setSubmitting(true);

      // Register User with Phone + DOB as Password
      const { error } = await signUp(
        validated.phone,
        validated.dob, // Format: YYYY-MM-DD
        validated.fullName,
        {
          data: {
            registration_type: "matrimony",
            full_name: validated.fullName, // Still passing this for consistency
            dob: validated.dob,
            father_name: validated.fatherName,
            mother_name: validated.motherName,
            salary: validated.salary,
            location: validated.city,
            caste: validated.caste,
            community: validated.community,
            occupation: validated.occupation,
            gender: validated.gender,
            details: {
              dob: validated.dob,
              father_name: validated.fatherName,
              mother_name: validated.motherName,
              caste: validated.caste,
              community: validated.community,
              salary: validated.salary,
              location: validated.city,
            }
          }
        }
      );

      if (error) throw error;

      toast({
        title: "Registration Successful! 🎉",
        description: "Your account has been created. Use your Phone Number and DOB to login.",
      });
      onClose();
      // Switch to Sign In tab potentially, or auto-login logic handles it
      onSignInClick && onSignInClick();

      setFormData({
        fullName: "",
        phone: "",
        fatherName: "",
        motherName: "",
        salary: "",
        city: "",
        caste: "",
        community: "",
        occupation: "",
        dob: "",
        gender: "",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else {
        console.error(error);
        toast({ title: "Registration Failed", description: error.message || "Failed to create account.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 mt-2 w-full lg:w-[60rem]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-champagne/90 font-serif tracking-wide">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Name"
            required
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-champagne/90 font-serif tracking-wide">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Phone"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-champagne/90 font-serif tracking-wide">Gender</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            disabled={submitting}
            className="w-full h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl px-3 border disabled:opacity-50"
          >
            <option value="" className="bg-charcoal text-gray-400">Gender</option>
            <option value="male" className="bg-charcoal">Male</option>
            <option value="female" className="bg-charcoal">Female</option>
            <option value="other" className="bg-charcoal">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob" className="text-champagne/90 font-serif tracking-wide">Date of Birth</Label>
          <div className="relative">
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              disabled={submitting}
              className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 disabled:opacity-50"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne/50 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherName" className="text-champagne/90 font-serif tracking-wide">Father's Name</Label>
          <Input
            id="fatherName"
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
            placeholder="Father's Name"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName" className="text-champagne/90 font-serif tracking-wide">Mother's Name</Label>
          <Input
            id="motherName"
            value={formData.motherName}
            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
            placeholder="Mother's Name"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="caste" className="text-champagne/90 font-serif tracking-wide">Caste</Label>
          <Input
            id="caste"
            value={formData.caste}
            onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
            placeholder="Caste"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="community" className="text-champagne/90 font-serif tracking-wide">Community</Label>
          <Input
            id="community"
            value={formData.community}
            onChange={(e) => setFormData({ ...formData, community: e.target.value })}
            placeholder="Community"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupation" className="text-champagne/90 font-serif tracking-wide">Occupation</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            placeholder="Occupation"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="salary" className="text-champagne/90 font-serif tracking-wide">Salary</Label>
          <Input
            id="salary"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            placeholder="Annual Salary"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="city" className="text-champagne/90 font-serif tracking-wide">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City"
            disabled={submitting}
            className="h-11 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl disabled:opacity-50"
          />
        </div>
      </div>

      <Button type="submit" className="w-1/3 mx-auto flex justify-center h-10 text-lg gold-gradient text-primary-foreground shadow-gold hover:scale-[1.02] transition-transform rounded-xl" disabled={submitting}>
        {submitting ? "Submitting..." : "Begin Your Journey"}
      </Button>

      <div className="text-center text-sm text-champagne/60">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignInClick}
          className="text-gold hover:underline font-medium"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};

const SignInForm = ({ onRegisterClick, onForgotClick }: { onRegisterClick?: () => void, onForgotClick?: () => void }) => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await signIn(formData.phone, formData.password);

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });

      window.location.href = '/matrimony/profile';
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6 mt-6">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="signin-phone" className="text-champagne/90 font-serif tracking-wide">Phone Number</Label>
          <Input
            id="signin-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter your phone number"
            required
            className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password" className="text-champagne/90 font-serif tracking-wide">Password</Label>
          </div>
          <Input
            id="signin-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
            required
            className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-champagne placeholder:text-champagne/30 rounded-xl"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-primary-foreground" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-champagne/80"
            >
              Remember me
            </label>
          </div>
          <button type="button" onClick={onForgotClick} className="text-sm font-medium text-gold hover:text-gold-light hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-1/2 mx-auto flex h-10 text-lg gold-gradient text-primary-foreground shadow-gold hover:scale-[1.02] transition-transform rounded-xl" disabled={submitting}>
          {submitting ? "Signing In..." : "Sign In"}
        </Button>
      </div>

      <div className="text-center text-sm text-champagne/60">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-gold hover:underline font-medium"
        >
          Register for free
        </button>
      </div>
    </form>
  );
};

const ForgotPasswordForm = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const [formData, setFormData] = useState({
    phone: "",
    dob: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost/kind-craft-portal/api/auth/reset_matrimony_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          dob: formData.dob,
          new_password: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Reset failed");

      toast({ title: "Success", description: "Password reset successful! Please login." });
      onBackToLogin();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="space-y-5 mt-4">
      <div className="space-y-2">
        <Label className="text-champagne/90 font-serif">Mobile Number</Label>
        <Input
          required
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-champagne rounded-xl"
          placeholder="Enter registered mobile"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-champagne/90 font-serif">Date of Birth (Verification)</Label>
        <div className="relative">
          <Input
            required
            type="date"
            value={formData.dob}
            onChange={e => setFormData({ ...formData, dob: e.target.value })}
            className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-champagne rounded-xl [color-scheme:dark] pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne/50 pointer-events-none" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-champagne/90 font-serif">New Password</Label>
        <Input
          required
          type="password"
          value={formData.newPassword}
          onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
          className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-champagne rounded-xl"
          placeholder="Enter new password"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-champagne/90 font-serif">Confirm New Password</Label>
        <Input
          required
          type="password"
          value={formData.confirmPassword}
          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-champagne rounded-xl"
          placeholder="Confirm new password"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 gold-gradient text-primary-foreground font-bold shadow-gold rounded-xl">
        {loading ? "Resetting..." : "Reset Password"}
      </Button>

      <div className="text-center pt-2">
        <button type="button" onClick={onBackToLogin} className="text-gold hover:underline text-sm font-medium">
          Back to Login
        </button>
      </div>
    </form>
  );
};

const Matrimony = () => {
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"register" | "signin" | "forgot-password">("signin");


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



  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === "all" || profile.gender.toLowerCase() === genderFilter;
    return matchesSearch && matchesGender;
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <MainLayout showFooter={true}>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden py-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={matrimonyHero} alt="Happy Couple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
        </div>

        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 gold-gradient rounded-full blur-3xl opacity-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 h-full">
          <div className="grid lg:grid-cols-4 gap-8 h-full items-center">

            {/* Left Column: Minimal Caption */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:flex flex-col justify-center lg:col-span-1"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-champagne leading-tight"
              >
                Find Your <span className="text-gold-gradient">Forever.</span>
              </motion.h1>
            </motion.div>

            {/* Right Column: Auth Tabs - Fits Page */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`w-full ml-auto h-full flex flex-col justify-center lg:col-span-3 ${activeTab === "signin" || activeTab === "forgot-password" ? "items-end lg:pr-10" : "items-center"}`}
            >
              <motion.div
                className={`bg-transparent backdrop-blur-xl border border-gold/20 rounded-3xl shadow-2xl w-auto h-auto flex flex-col justify-center overflow-hidden ${activeTab === "signin" || activeTab === "forgot-password" ? "p-10" : "p-6"}`}
              >
                <AnimatePresence mode="wait">
                  {activeTab === "register" ? (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-serif font-bold text-champagne">Create Profile</h3>
                      </div>
                      <RegistrationForm onClose={() => setActiveTab("register")} onSignInClick={() => setActiveTab("signin")} />
                    </motion.div>
                  ) : activeTab === "signin" ? (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-serif font-bold text-champagne">Welcome Back</h3>
                      </div>
                      <SignInForm
                        onRegisterClick={() => setActiveTab("register")}
                        onForgotClick={() => setActiveTab("forgot-password")}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="forgot-password"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-serif font-bold text-champagne">Reset Password</h3>
                        <p className="text-champagne/60 text-sm mt-2">Verify details to set new password</p>
                      </div>
                      <ForgotPasswordForm onBackToLogin={() => setActiveTab("signin")} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

    </MainLayout >
  );
};

export default Matrimony;
