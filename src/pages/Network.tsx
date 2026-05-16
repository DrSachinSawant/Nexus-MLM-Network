import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, User, TrendingUp, GitBranch, Award } from "lucide-react";

export default function Network() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | undefined>();
  const { data: downlineData, isLoading } = trpc.genealogy.getDownline.useQuery({
    level: levelFilter,
    limit: 50,
    offset: 0,
  });

  const { data: stats } = trpc.dashboard.getStats.useQuery();

  const levels = [1, 2, 3, 4, 5, 6, 7];

  const members = downlineData?.members?.filter(m => {
    if (!search) return true;
    return m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase());
  }) || [];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Users className="w-6 h-6 text-[#2962FF]" />
          My Network
        </h1>
        <p className="text-[#5C6BC0] mt-1">Manage your team and downline members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E8EFFF] flex items-center justify-center"><Users className="w-6 h-6 text-[#2962FF]" /></div>
            <div><p className="text-xs text-[#90A4AE]">Direct Referrals</p><p className="text-2xl font-bold text-[#1A237E]">{stats?.directReferrals || 0}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><GitBranch className="w-6 h-6 text-[#4CAF50]" /></div>
            <div><p className="text-xs text-[#90A4AE]">Total Team</p><p className="text-2xl font-bold text-[#1A237E]">{stats?.teamSize || 0}</p></div>
          </CardContent>
        </Card>
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8E1] flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#FF9800]" /></div>
            <div><p className="text-xs text-[#90A4AE]">Team Business</p><p className="text-2xl font-bold text-[#1A237E]">Rs. {(stats?.totalBusinessVolume || 0).toLocaleString("en-IN")}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Level Filters + Search */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant={levelFilter === undefined ? "default" : "outline"} size="sm" onClick={() => setLevelFilter(undefined)} className={levelFilter === undefined ? "bg-[#2962FF]" : "border-[#E3E8EE]"}>All</Button>
        {levels.map(l => (
          <Button key={l} variant={levelFilter === l ? "default" : "outline"} size="sm" onClick={() => setLevelFilter(l)} className={levelFilter === l ? "bg-[#2962FF]" : "border-[#E3E8EE]"}>L{l}</Button>
        ))}
        <div className="relative ml-auto max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member..." className="pl-9 h-9 border-[#E3E8EE] text-sm" />
        </div>
      </div>

      {/* Members Table */}
      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E]">Team Members ({members.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#E3E8EE]">
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Member</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Level</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Rank</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Status</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Team Size</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Business Vol</th>
              </tr></thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA]">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E8EFFF] flex items-center justify-center"><User className="w-4 h-4 text-[#2962FF]" /></div>
                        <div><p className="font-medium text-[#1A237E]">{m.name}</p><p className="text-[10px] text-[#90A4AE]">{m.memberId}</p></div>
                      </div>
                    </td>
                    <td className="py-3 px-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8EFFF] text-[#2962FF]">L{m.level}</span></td>
                    <td className="py-3 px-2"><span className="flex items-center gap-1"><Award className="w-3 h-3" style={{ color: m.rankColor }} /><span style={{ color: m.rankColor }} className="text-xs font-medium">{m.rank}</span></span></td>
                    <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.status === "ACTIVE" ? "bg-[#E8F5E9] text-[#4CAF50]" : m.status === "PENDING" ? "bg-[#FFF3E0] text-[#FF9800]" : "bg-[#FFEBEE] text-[#F44336]"}`}>{m.status}</span></td>
                    <td className="py-3 px-2 text-right text-[#1A237E]">{m.teamSize}</td>
                    <td className="py-3 px-2 text-right text-[#1A237E]">Rs. {parseFloat(m.businessVolume?.toString() || "0").toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {members.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-[#90A4AE]">No members found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
