import { ReactNode, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Gem, LayoutDashboard, Package, Heart, Users, LogOut, Loader2 } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Matrimony", path: "/admin/matrimony", icon: Heart },
  { name: "Members", path: "/admin/members", icon: Users },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-emerald-950/95 to-black border-r border-gold/20 flex flex-col backdrop-blur-xl transition-all duration-300">
        <div className="p-6 border-b border-gold/10">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <Gem className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="font-serif font-bold text-xl text-gold tracking-wide">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                  ? "bg-emerald-900/40 text-gold border-gold/20 shadow-lg translate-x-1"
                  : "text-emerald-100/70 hover:bg-emerald-900/20 hover:text-gold hover:translate-x-1"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-gold" : "text-emerald-100/50 group-hover:text-gold"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold/10">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-emerald-100/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[url('/noise.png')] bg-opacity-5">
        <header className="h-20 border-b border-gold/20 bg-black/95 backdrop-blur-sm flex items-center justify-between px-8 shadow-2xl z-10">
          <h1 className="text-2xl font-serif font-bold text-gold tracking-wide">{title}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-900/20 border border-gold/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-emerald-100/80 font-medium">{user.email}</span>
            </div>
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold hover:text-emerald-950 transition-colors">
                View Website
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
