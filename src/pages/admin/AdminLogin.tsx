import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gem, Lock, Mail, AlertCircle, Phone } from "lucide-react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(username, password);

      if (error) {
        // If user doesn't exist, show appropriate message
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please check your email and password.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful! ✨",
        description: "Welcome to the admin panel.",
      });

      // Navigate after successful login
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(38_70%_45%_/_0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(15_50%_55%_/_0.1),_transparent_50%)]" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-gold"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <Gem className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold text-champagne mb-2">
            Admin
          </h1>
          <p className="text-champagne/60">
            Sign in to manage your business
          </p>
        </div>

        <motion.div
          className="bg-card/95 backdrop-blur-xl p-10 rounded-3xl shadow-gold border border-gold/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="tel"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className="h-14 pl-12 rounded-xl border-border focus:border-primary text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-14 pl-12 rounded-xl border-border focus:border-primary text-base"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 gold-gradient text-primary-foreground shadow-gold text-lg font-semibold rounded-xl"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Lock className="mr-2 w-5 h-5" />
                    Sign In to Dashboard
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p
          className="text-center mt-8 text-champagne/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <a href="/" className="text-gold hover:underline inline-flex items-center gap-1">
            ← Back to Website
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
