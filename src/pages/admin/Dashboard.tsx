import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Heart, Users, Mail, UserCheck, TrendingUp, ArrowUpRight, Activity } from "lucide-react";

interface Stats {
  products: number;
  matrimony: number;
  members: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    matrimony: 0,
    members: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
  }, []);

  const fetchStats = async () => {
    try {
      const [products, matrimony, members] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("matrimony_profiles").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        products: products.count || 0,
        matrimony: matrimony.count || 0,
        members: members.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Products", value: stats.products, icon: Package, color: "from-gold to-yellow-600", change: "+12%" },
    { title: "Matrimony Profiles", value: stats.matrimony, icon: Heart, color: "from-emerald-500 to-emerald-700", change: "+8%" },
    { title: "Active Members", value: stats.members, icon: Users, color: "from-rose-500 to-pink-600", change: "+5%" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-950 to-black border border-gold/20 rounded-3xl p-8 text-champagne relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_hsl(38_70%_45%_/_0.15),_transparent_50%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-2 text-gold">Welcome back, Admin! 👋</h2>
            <p className="text-emerald-100/70 mb-6">Here's what's happening with your business today.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-emerald-900/40 border border-gold/20 px-4 py-2 rounded-full text-sm">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-emerald-100">All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-black/40 border-gold/20 backdrop-blur-sm shadow-lg hover:shadow-gold/10 hover:border-gold/40 transition-all duration-300 group overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-100/60 font-serif tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-white font-serif">
                      {loading ? "..." : stat.value}
                    </div>
                    <span className="text-xs text-emerald-400 font-medium flex items-center bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-500/20">
                      {stat.change}
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-black/40 border-gold/20 backdrop-blur-sm shadow-xl h-full">
              <CardHeader className="border-b border-gold/10 pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-xl text-gold">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  Recent Registrations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-emerald-100/40 text-center py-8 italic font-serif">No recent registrations</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/40 border-gold/20 backdrop-blur-sm shadow-xl h-full">
              <CardHeader className="border-b border-gold/10 pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-xl text-gold">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {[
                  { label: "Add New Product", desc: "Create a new jewelry item", href: "/admin/products" },
                  { label: "Review Messages", desc: "Check customer inquiries", href: "/admin/messages" },
                  { label: "Manage Registrations", desc: "Approve or reject requests", href: "/admin/registrations" },
                  { label: "View Matrimony Profiles", desc: "Manage profile listings", href: "/admin/matrimony" },
                ].map((action, i) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between p-4 bg-emerald-900/10 border border-gold/5 rounded-xl hover:bg-emerald-900/30 hover:border-gold/30 transition-all duration-300 group"
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <p className="font-medium text-emerald-100 group-hover:text-gold transition-colors">{action.label}</p>
                      <p className="text-sm text-emerald-100/50">{action.desc}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-emerald-100/30 group-hover:text-gold transition-colors" />
                  </motion.a>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
