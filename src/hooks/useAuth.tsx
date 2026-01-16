import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { API_URL } from "@/integrations/supabase/client";

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
  getTokenKey: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get token key based on current portal path
const getTokenKey = () => {
  const path = window.location.pathname;
  if (path.includes('/admin')) return "sb-admin-token";
  if (path.includes('/matrimony')) return "sb-matrimony-token";
  if (path.includes('/member') || path.includes('/members')) return "sb-member-token";
  return "sb-member-token"; // Default to member token for general site access
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // We track the current portal to detect when to re-validate
  const [currentKey, setCurrentKey] = useState(getTokenKey());

  // Listen for URL changes even though we are outside BrowserRouter
  useEffect(() => {
    const handleLocationChange = () => {
      const newKey = getTokenKey();
      if (newKey !== currentKey) {
        setCurrentKey(newKey);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    // Also wrap pushState to detect internal navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, [currentKey]);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const token = localStorage.getItem(currentKey);

      if (!token) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me.php`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const roles = data.data.app_metadata?.roles || [];
          const isUserAdmin = roles.includes('admin');

          // Security check: If on admin portal, must be admin
          if (currentKey === 'sb-admin-token' && !isUserAdmin) {
            localStorage.removeItem(currentKey);
            throw new Error("Unauthorized portal access");
          }

          const userData = {
            id: data.data.id,
            phone: data.data.phone,
            role: data.data.role
          };

          setUser(userData);
          setSession({ access_token: token, user: userData });
          setIsAdmin(isUserAdmin);
        } else {
          localStorage.removeItem(currentKey);
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Session check failed", error);
        localStorage.removeItem(currentKey);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [currentKey]);

  const signIn = async (phone: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Login failed") };
      }

      const roles = data.data.user.app_metadata?.roles || [];
      const isUserAdmin = roles.includes('admin');

      // Re-verify intended portal key
      const targetKey = getTokenKey();
      if (targetKey === 'sb-admin-token' && !isUserAdmin) {
        return { error: new Error("You do not have administrative privileges.") };
      }

      // Exclusive login rule: Clear other portal tokens
      const allKeys = ["sb-admin-token", "sb-matrimony-token", "sb-member-token"];
      allKeys.forEach(k => {
        localStorage.removeItem(k);
      });

      const token = data.data.session.access_token;
      localStorage.setItem(targetKey, token);

      const userData = {
        id: data.data.user.id,
        phone: data.data.user.phone,
        role: data.data.user.role
      };

      setUser(userData);
      setSession({ access_token: token, user: userData });
      setIsAdmin(isUserAdmin);
      setCurrentKey(targetKey);

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

      const response = await fetch(`${API_URL}/auth/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Registration failed") };
      }

      const targetKey = getTokenKey();
      const allKeys = ["sb-admin-token", "sb-matrimony-token", "sb-member-token"];
      allKeys.forEach(k => localStorage.removeItem(k));

      const token = data.data.session.access_token;
      localStorage.setItem(targetKey, token);

      const userData = {
        id: data.data.user.id,
        phone: data.data.user.phone,
        role: data.data.user.role
      };

      setUser(userData);
      setSession({ access_token: token, user: userData });
      setCurrentKey(targetKey);

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    const keyToClear = getTokenKey();
    localStorage.removeItem(keyToClear);
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut, getTokenKey }}>
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
