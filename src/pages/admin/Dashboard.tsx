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
    { title: "Total Products", value: stats.products, icon: Package, color: "from-gold to-gold-dark", change: "+12%" },
    { title: "Matrimony Profiles", value: stats.matrimony, icon: Heart, color: "from-rose-gold to-accent", change: "+8%" },
    { title: "Active Members", value: stats.members, icon: Users, color: "from-primary to-charcoal", change: "+5%" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-3xl p-8 text-champagne relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,_hsl(38_70%_45%_/_0.15),_transparent_50%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-2">Welcome back, Admin! 👋</h2>
            <p className="text-champagne/70 mb-6">Here's what's happening with your business today.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gold/20 px-4 py-2 rounded-full text-sm">
                <Activity className="w-4 h-4 text-gold" />
                <span>All systems operational</span>
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
              <Card className="border-border shadow-card hover:shadow-gold transition-all duration-300 group overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-4xl font-bold text-foreground">
                      {loading ? "..." : stat.value}
                    </div>
                    <span className="text-xs text-primary font-medium flex items-center">
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
            <Card className="border-border shadow-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Recent Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* {recentRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {recentRegistrations.map((reg, i) => (
                      <motion.div
                        key={reg.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center text-primary-foreground font-bold">
                            {reg.full_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{reg.full_name}</p>
                            <p className="text-sm text-muted-foreground">{reg.registration_type}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${reg.status === "approved" ? "bg-green-100 text-green-800" :
                            reg.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                          }`}>
                          {reg.status || "pending"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent registrations</p>
                )} */}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border shadow-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Add New Product", desc: "Create a new jewelry item", href: "/admin/products" },
                  { label: "Review Messages", desc: "Check customer inquiries", href: "/admin/messages" },
                  { label: "Manage Registrations", desc: "Approve or reject requests", href: "/admin/registrations" },
                  { label: "View Matrimony Profiles", desc: "Manage profile listings", href: "/admin/matrimony" },
                ].map((action, i) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-primary/5 transition-colors group"
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
