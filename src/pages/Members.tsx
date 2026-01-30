import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, API_URL } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Crown, ArrowRight, Mail, Phone, Lock } from "lucide-react";
import { z } from "zod";
import membersHero from "@/assets/members-hero.png";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(15),
  address: z.string().trim().min(1, "Address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- Auth Components ---

import { useAuth } from "@/hooks/useAuth";
import { Search, MapPin as MapPinIcon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const MemberRegistrationForm = ({ onClose, onSignInClick }: { onClose: () => void, onSignInClick: () => void }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    password: "",
    referralCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = registrationSchema.parse({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      });
      setSubmitting(true);

      const { error } = await signUp(validated.phone, validated.password, validated.fullName, {
        data: {
          registration_type: "member",
          full_name: validated.fullName,
          phone: validated.phone,
          address: validated.address,
          referral_code: formData.referralCode, // Added referral code
        }
      });

      if (error) throw error;

      toast({
        title: "Welcome to the Community! 🎉",
        description: "Your membership account has been created.",
      });

      setTimeout(() => {
        navigate("/member/dashboard");
      }, 500);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "Registration Failed", description: error.message || "Failed to create account.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 mt-2 w-full max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-2">
        <Label className="text-gold font-serif">Full Name</Label>
        <Input
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="John Doe"
          required
          className="h-10 bg-white/5 border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gold font-serif">Phone Number</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
            required
            className="h-10 bg-white/5 border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gold font-serif">Create Password</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min 6 characters"
            required
            className="h-10 bg-white/5 border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gold font-serif">Personal Address</Label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter your complete address"
          required
          className="h-10 bg-white/5 border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gold font-serif text-sm">Referral Code (Optional)</Label>
        <Input
          value={formData.referralCode}
          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          placeholder="Enter code if you were referred"
          className="h-10 bg-white/5 border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full h-12 gold-gradient text-emerald-950 font-black shadow-gold hover:scale-[1.02] transition-transform rounded-xl mt-4">
        {submitting ? "Creating Membership..." : "Confirm & Join Now"}
      </Button>

      <div className="text-center text-sm text-gray-500 py-2">
        Already a member?{" "}
        <button type="button" onClick={onSignInClick} className="text-gold hover:underline font-medium">
          Sign In
        </button>
      </div>
    </form>
  );
};

const MemberSignInForm = ({ onRegisterClick, onForgotClick }: { onRegisterClick: () => void, onForgotClick: () => void }) => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await signIn(formData.phone, formData.password);

      if (error) throw error;

      toast({ title: "Welcome back!", description: "Successfully signed in." });

      // Delay navigation slightly to let state update if needed, but navigate ensures no full reload if possible
      setTimeout(() => {
        navigate("/member/dashboard");
      }, 500);

    } catch (error: any) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-5 mt-4">
      <div className="space-y-2">
        <Label className="text-gold font-serif">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
            required
            className="h-11 pl-10 bg-transparent border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-gold font-serif">Password</Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
            required
            className="h-11 pl-10 bg-transparent border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl"
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full h-11 gold-gradient text-primary-foreground font-bold shadow-gold hover:scale-[1.02] transition-transform rounded-xl">
        {submitting ? "Signing In..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-gray-500 pt-2">
        Not a member yet?{" "}
        <button type="button" onClick={onRegisterClick} className="text-gold hover:underline font-medium">
          Register for free
        </button>
      </div>
    </form>
  );
};

const MemberForgotPasswordForm = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const [formData, setFormData] = useState({ phone: "", newPassword: "", confirmPassword: "" });
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
      const response = await fetch(`${API_URL}/auth/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
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
    <form onSubmit={handleReset} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label className="text-gold font-serif">Registered Phone</Label>
        <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label className="text-gold font-serif">New Password</Label>
        <Input required type="password" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label className="text-gold font-serif">Confirm Password</Label>
        <Input required type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="h-10 bg-transparent border-gold/20 focus:border-gold/50 text-gray-900 rounded-xl" />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 gold-gradient text-primary-foreground font-bold shadow-gold rounded-xl mt-2">
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
      <div className="text-center pt-2">
        <button type="button" onClick={onBackToLogin} className="text-gold hover:underline text-sm font-medium">Back to Login</button>
      </div>
    </form>
  );
};


const Members = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"register" | "signin" | "forgot-password">("register");

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <MainLayout showFooter={false}>
      {/* Hero Section with Auth Tabs */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden py-8 bg-gray-50">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={membersHero} alt="Exclusive Membership" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/80 md:bg-white/40" />
        </div>

        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-64 h-64 gold-gradient rounded-full blur-3xl opacity-20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 h-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center h-full">

            {/* Left Column: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <motion.span
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold-700 border border-gold/30 rounded-full text-sm font-bold mb-6"
              >
                <Crown className="w-4 h-4" />
                Exclusive Membership
              </motion.span>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-gray-900 mb-6 leading-tight"
              >
                Join Our
                <span className="block text-gold">Elite Community</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed"
              >
                Become a member and unlock exclusive benefits, premium discounts, and personalized services
                that make every moment special.
              </motion.p>
            </motion.div>

            {/* Right Column: Auth Forms or Dashboard Access */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md ml-auto"
            >
              <div className="bg-white border text-gray-900 rounded-[2rem] shadow-2xl p-8">
                {user ? (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                      <Crown className="w-10 h-10 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-gray-900">Welcome Back!</h3>
                      <p className="text-gray-500 mt-2">You are currently signed in.</p>
                    </div>
                    <Button
                      onClick={() => navigate("/member/dashboard")}
                      className="w-full h-12 bg-gold text-white font-black shadow-lg shadow-gold/20 hover:scale-[1.02] transition-transform rounded-xl"
                    >
                      Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
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
                          <h3 className="text-2xl font-serif font-bold text-gray-900">Create Account</h3>
                          <p className="text-gray-500 text-sm">Join the family today</p>
                        </div>
                        <MemberRegistrationForm
                          onClose={() => setActiveTab("register")}
                          onSignInClick={() => setActiveTab("signin")}
                        />
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
                          <h3 className="text-2xl font-serif font-bold text-gray-900">Welcome Back</h3>
                          <p className="text-gray-500 text-sm">Sign in to your account</p>
                        </div>
                        <MemberSignInForm
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
                          <h3 className="text-2xl font-serif font-bold text-gray-900">Reset Password</h3>
                          <p className="text-gray-500 text-sm">Verify details to continue</p>
                        </div>
                        <MemberForgotPasswordForm onBackToLogin={() => setActiveTab("signin")} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Members;
