import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, ArrowDownToLine, Clock, TrendingUp, Wallet, Shield, UserCheck, UserX } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Navigate } from "react-router";

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAuth();
  const { data: stats } = trpc.admin.getDashboardStats.useQuery(undefined, { enabled: isAdmin });
  const { data: chartData } = trpc.admin.getGrowthChart.useQuery({ period: "month" }, { enabled: isAdmin });

  if (isLoading) return <AppShell><div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2962FF]" /></div></AppShell>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#2962FF]" />
          Admin Dashboard
        </h1>
        <p className="text-[#5C6BC0] mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard title="Total Members" value={stats?.totalMembers || 0} icon={<Users className="w-5 h-5" />} color="#2962FF" />
        <AdminStatCard title="Active Members" value={stats?.activeMembers || 0} icon={<UserCheck className="w-5 h-5" />} color="#4CAF50" />
        <AdminStatCard title="Inactive Members" value={stats?.inactiveMembers || 0} icon={<UserX className="w-5 h-5" />} color="#F44336" />
        <AdminStatCard title="Pending KYC" value={stats?.pendingKyc || 0} icon={<Clock className="w-5 h-5" />} color="#FF9800" />
        <AdminStatCard title="Total Revenue" value={`Rs. ${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`} icon={<DollarSign className="w-5 h-5" />} color="#7C4DFF" />
        <AdminStatCard title="Commission Payout" value={`Rs. ${(stats?.totalCommissionPayout || 0).toLocaleString("en-IN")}`} icon={<TrendingUp className="w-5 h-5" />} color="#00BCD4" />
        <AdminStatCard title="Total Withdrawn" value={`Rs. ${(stats?.totalWithdrawn || 0).toLocaleString("en-IN")}`} icon={<ArrowDownToLine className="w-5 h-5" />} color="#E91E63" />
        <AdminStatCard title="Wallet Balance" value={`Rs. ${(stats?.totalWalletBalance || 0).toLocaleString("en-IN")}`} icon={<Wallet className="w-5 h-5" />} color="#FFC400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E]">Member Growth (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData || []}>
                <defs><linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2962FF" stopOpacity={0.1} /><stop offset="95%" stopColor="#2962FF" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E3E8EE" }} />
                <Area type="monotone" dataKey="members" stroke="#2962FF" strokeWidth={2} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E]">Commission Trends (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData || []}>
                <defs><linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1} /><stop offset="95%" stopColor="#4CAF50" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E3E8EE" }} formatter={(v: number) => [`Rs. ${v.toLocaleString("en-IN")}`, "Commissions"]} />
                <Area type="monotone" dataKey="commissions" stroke="#4CAF50" strokeWidth={2} fill="url(#colorComm)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function AdminStatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-[#E3E8EE] shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
          <div><p className="text-xs text-[#90A4AE] uppercase tracking-wider">{title}</p><p className="text-lg font-bold text-[#1A237E]">{value}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
