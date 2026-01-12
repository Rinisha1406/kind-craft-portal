import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Heart, Users, Mail, UserCheck, TrendingUp, ArrowUpRight, Activity, Newspaper } from "lucide-react";

interface Stats {
  products: number;
  matrimony: number;
  members: number;
  messages: number;
  blogs: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    matrimony: 0,
    members: 0,
    messages: 0,
    blogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [products, matrimony, members, messages, news, rasi] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("matrimony_profiles").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("rasi_palan").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        products: products.count || 0,
        matrimony: matrimony.count || 0,
        members: members.count || 0,
        messages: messages.count || 0,
        blogs: (news.count || 0) + (rasi.count || 0),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Products", value: stats.products, icon: Package, color: "from-gold to-yellow-600", change: "+12%" },
    { title: "Matrimony Profiles", value: stats.matrimony, icon: Heart, color: "from-emerald-500 to-emerald-700", change: "+8%" },
    { title: "Active Members", value: stats.members, icon: Users, color: "from-rose-500 to-pink-600", change: "+5%" },
    { title: "Total Messages", value: stats.messages, icon: Mail, color: "from-blue-500 to-cyan-600", change: "+10%" },
    { title: "News & Rasi Palan", value: stats.blogs, icon: Newspaper, color: "from-purple-500 to-indigo-600", change: "Daily" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-emerald-100 rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-emerald-900 relative overflow-hidden shadow-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-2 text-emerald-900">Welcome back, Admin! 👋</h2>
            <p className="text-emerald-700/70 mb-4 lg:mb-6 text-sm lg:text-base">Here's what's happening with your business today.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-sm">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 font-serif tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-zinc-900 font-serif">
                      {loading ? "..." : stat.value}
                    </div>
                    <span className="text-xs text-emerald-600 font-medium flex items-center bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                      {stat.change}
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions (Full Width now) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <CardTitle className="flex items-center gap-2 font-serif text-xl text-emerald-900">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 pt-6">
              {[
                { label: "Add New Product", desc: "Create a new jewelry item", href: "/admin/products" },
                { label: "Review Messages", desc: "Check customer inquiries", href: "/admin/messages" },
                { label: "Manage Blogs", desc: "Update News & Rasi Palan", href: "/admin/blogs" },
                { label: "Manage Registrations", desc: "Approve or reject requests", href: "/admin/registrations" },
                { label: "View Matrimony Profiles", desc: "Manage profile listings", href: "/admin/matrimony" },
              ].map((action, i) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 group"
                  whileHover={{ x: 5 }}
                >
                  <div>
                    <p className="font-medium text-zinc-900 group-hover:text-emerald-700 transition-colors">{action.label}</p>
                    <p className="text-sm text-zinc-500">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                </motion.a>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
