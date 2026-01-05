import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Heart, Users, Mail, UserCheck, TrendingUp } from "lucide-react";

interface Stats {
  products: number;
  matrimony: number;
  members: number;
  messages: number;
  registrations: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    matrimony: 0,
    members: 0,
    messages: 0,
    registrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, matrimony, members, messages, registrations] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("matrimony_profiles").select("id", { count: "exact", head: true }),
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        products: products.count || 0,
        matrimony: matrimony.count || 0,
        members: members.count || 0,
        messages: messages.count || 0,
        registrations: registrations.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Products", value: stats.products, icon: Package, color: "text-primary" },
    { title: "Matrimony Profiles", value: stats.matrimony, icon: Heart, color: "text-rose-gold" },
    { title: "Members", value: stats.members, icon: Users, color: "text-gold" },
    { title: "Unread Messages", value: stats.messages, icon: Mail, color: "text-accent" },
    { title: "Pending Registrations", value: stats.registrations, icon: UserCheck, color: "text-primary" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {loading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-muted rounded-xl">
                <h3 className="font-semibold text-foreground mb-2">Recent Activity</h3>
                <p className="text-muted-foreground text-sm">
                  Manage your products, matrimony profiles, and member registrations from the sidebar navigation.
                </p>
              </div>
              <div className="p-6 bg-muted rounded-xl">
                <h3 className="font-semibold text-foreground mb-2">Getting Started</h3>
                <p className="text-muted-foreground text-sm">
                  Start by adding products to your catalog. Then review pending registrations and messages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
