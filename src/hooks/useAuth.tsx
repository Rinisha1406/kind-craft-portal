import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Types
interface User {
  id: string;
  phone: string;
  role?: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (phone: string, password: string, fullName?: string, options?: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to get token
  const getToken = () => localStorage.getItem("auth_token");

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost/kind-craft-portal/api/auth/me.php", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = {
            id: data.data.id,
            phone: data.data.phone,
            role: data.data.role
          };
          const newSession = {
            access_token: token,
            user
          };

          setUser(user);
          setSession(newSession);

          // Check admin role
          const roles = data.data.app_metadata?.roles || [];
          setIsAdmin(roles.includes('admin'));
        } else {
          // Invalid token
          localStorage.removeItem("auth_token");
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (phone: string, password: string) => {
    try {
      const response = await fetch("http://localhost/kind-craft-portal/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Login failed") };
      }

      const token = data.data.session.access_token;
      localStorage.setItem("auth_token", token);

      const user = {
        id: data.data.user.id,
        phone: data.data.user.phone,
        role: data.data.user.role
      };

      setUser(user);
      setSession({ access_token: token, user });

      const roles = data.data.user.app_metadata?.roles || [];
      setIsAdmin(roles.includes('admin'));

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (phone: string, password: string, fullName?: string, options?: any) => {
    try {
      const payload = {
        phone,
        password,
        options: {
          data: {
            full_name: fullName,
            ...options?.data
          }
        }
      };

      const response = await fetch("http://localhost/kind-craft-portal/api/auth/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Registration failed") };
      }

      // Auto login after signup
      const token = data.data.session.access_token;
      localStorage.setItem("auth_token", token);

      const user = {
        id: data.data.user.id,
        phone: data.data.user.phone,
        role: data.data.user.role
      };

      setUser(user);
      setSession({ access_token: token, user });

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
