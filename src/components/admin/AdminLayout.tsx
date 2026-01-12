import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Gem, LayoutDashboard, Package, Heart, Users, LogOut, Loader2, Sparkles, Mail, Newspaper, Menu, X } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Services", path: "/admin/services", icon: Sparkles },
  { name: "Matrimony", path: "/admin/matrimony", icon: Heart },
  { name: "Members", path: "/admin/members", icon: Users },
  { name: "Messages", path: "/admin/messages", icon: Mail },
  { name: "News & Palan", path: "/admin/blogs", icon: Newspaper },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="h-screen bg-zinc-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-64 bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 shadow-sm
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-emerald-100 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-emerald-900 tracking-wide">Admin</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                  ? "bg-emerald-50 text-emerald-900 shadow-sm"
                  : "text-zinc-600 hover:bg-emerald-50/50 hover:text-emerald-700"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-emerald-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 lg:h-20 border-b border-zinc-200 bg-white flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg lg:text-2xl font-serif font-bold text-emerald-900 tracking-wide truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Online</span>
            </div>
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">
                <span className="hidden sm:inline">View Website</span>
                <span className="sm:hidden">Site</span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-auto bg-zinc-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
