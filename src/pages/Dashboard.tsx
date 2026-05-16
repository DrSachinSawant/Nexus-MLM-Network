import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  DollarSign,
  Award,
  ArrowRight,
  GitBranch,
  Wallet,
  ArrowDownToLine,
  FileText,
} from "lucide-react";
import { Link } from "react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

const COLORS = ["#2962FF", "#4CAF50", "#FFC400", "#FF9800"];

const pieData = [
  { name: "Direct", value: 10, color: "#2962FF" },
  { name: "Level 1", value: 5, color: "#4CAF50" },
  { name: "Level 2", value: 2.5, color: "#FFC400" },
  { name: "Level 3+", value: 7.5, color: "#FF9800" },
];

const areaData = [
  { name: "Mon", earnings: 2500 },
  { name: "Tue", earnings: 4200 },
  { name: "Wed", earnings: 3100 },
  { name: "Thu", earnings: 5800 },
  { name: "Fri", earnings: 4500 },
  { name: "Sat", earnings: 7200 },
  { name: "Sun", earnings: 3900 },
];

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: activity } = trpc.dashboard.getRecentActivity.useQuery(undefined, {
    enabled: !!user,
  });

  const isLoading = authLoading || statsLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2962FF]"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E]">
          Welcome back, {user?.name || "Member"}!
        </h1>
        <p className="text-[#5C6BC0] mt-1">Here&apos;s your business overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Earnings"
          value={`Rs. ${(stats?.totalEarnings || 0).toLocaleString("en-IN")}`}
          icon={<DollarSign className="w-6 h-6 text-[#2962FF]" />}
          change="+12.5%"
          positive
        />
        <StatCard
          title="Direct Referrals"
          value={String(stats?.directReferrals || 0)}
          icon={<Users className="w-6 h-6 text-[#4CAF50]" />}
          change="+3"
          positive
        />
        <StatCard
          title="Team Size"
          value={String(stats?.teamSize || 0)}
          icon={<GitBranch className="w-6 h-6 text-[#FF9800]" />}
          change="+18"
          positive
        />
        <StatCard
          title="Current Rank"
          value={user?.rankName || "New Member"}
          icon={<Award className="w-6 h-6 text-[#FFC400]" />}
          change={`${stats?.rankProgress || 0}%`}
          positive
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2962FF]" />
              Weekly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2962FF" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2962FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#90A4AE" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E3E8EE", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`Rs. ${value.toLocaleString("en-IN")}`, "Earnings"]}
                />
                <Area type="monotone" dataKey="earnings" stroke="#2962FF" strokeWidth={2} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commission Distribution */}
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1A237E]">
              Commission Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#1A237E]">{item.name}</span>
                  </div>
                  <span className="font-medium text-[#1A237E]">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2962FF]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity?.commissions?.slice(0, 5).map((comm, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F5F7FA] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1A237E]">
                      {comm.type === "DIRECT" ? "Direct Commission" : `Level ${comm.level} Commission`}
                    </p>
                    <p className="text-xs text-[#90A4AE]">
                      {comm.createdAt ? format(new Date(comm.createdAt), "dd MMM yyyy") : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#4CAF50]">
                    +Rs. {parseFloat(comm.amount?.toString() || "0").toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              {(!activity?.commissions || activity.commissions.length === 0) && (
                <p className="text-sm text-[#90A4AE] text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rank Progress */}
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FFC400]" />
              Rank Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-[#FFC400] mb-3">
                <span className="text-xl font-bold text-[#1A237E]">{stats?.rankProgress || 0}%</span>
              </div>
              <h3 className="text-lg font-semibold text-[#1A237E]">{user?.rankName || "New Member"}</h3>
              <p className="text-sm text-[#5C6BC0] mt-1">
                {stats?.directReferrals || 0} / 50 directs for next rank
              </p>
              <div className="w-full h-3 bg-[#E3E8EE] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2962FF] to-[#FFC400] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, stats?.rankProgress || 0)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[#90A4AE] uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionButton icon={<Users className="w-5 h-5" />} label="Register Member" path="/network" />
          <QuickActionButton icon={<GitBranch className="w-5 h-5" />} label="View Genealogy" path="/genealogy" />
          <QuickActionButton icon={<ArrowDownToLine className="w-5 h-5" />} label="Withdraw" path="/withdrawals" />
          <QuickActionButton icon={<FileText className="w-5 h-5" />} label="Reports" path="/commissions" />
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon, change, positive }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  positive: boolean;
}) {
  return (
    <Card className="border-[#E3E8EE] shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-[#E8EFFF] flex items-center justify-center">
            {icon}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${positive ? "bg-[#E8F5E9] text-[#4CAF50]" : "bg-[#FFEBEE] text-[#F44336]"}`}>
            {change}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-xs text-[#90A4AE] uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-[#1A237E] mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon, label, path }: { icon: React.ReactNode; label: string; path: string }) {
  return (
    <Link to={path}>
      <Button
        variant="outline"
        className="w-full h-auto py-4 flex flex-col items-center gap-2 border-[#E3E8EE] hover:bg-[#E8EFFF] hover:border-[#2962FF] group"
      >
        <div className="w-10 h-10 rounded-lg bg-[#E8EFFF] flex items-center justify-center text-[#2962FF] group-hover:bg-[#2962FF] group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-xs font-medium text-[#1A237E]">{label}</span>
      </Button>
    </Link>
  );
}
