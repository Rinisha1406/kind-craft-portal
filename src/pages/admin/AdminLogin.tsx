import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gem, Lock } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in as admin
  if (isAdmin) {
    navigate("/admin/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = loginSchema.parse({ email, password });
      setLoading(true);

      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is admin after login
      toast({
        title: "Login Successful",
        description: "Checking admin access...",
      });

      // Small delay to let auth state update
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
            <Gem className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-champagne mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Sign in to access the dashboard
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-soft border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-border focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-primary-foreground shadow-gold hover:opacity-90"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <Lock className="mr-2 w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          <a href="/" className="text-gold hover:underline">← Back to Website</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
