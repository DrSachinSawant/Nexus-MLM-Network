import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, User, Shield, Eye } from "lucide-react";
import { format } from "date-fns";
import { Navigate } from "react-router";

export default function AdminMembers() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const { data: membersData, isLoading } = trpc.member.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    limit: 100,
    offset: 0,
  });

  const updateStatus = trpc.member.updateStatus.useMutation({
    onSuccess: () => window.location.reload(),
  });

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Users className="w-6 h-6 text-[#2962FF]" />
          Member Management
        </h1>
        <p className="text-[#5C6BC0] mt-1">View and manage all network members</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, email..." className="pl-9 border-[#E3E8EE]" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 border-[#E3E8EE]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E]">All Members ({membersData?.total || 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#E3E8EE]">
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Member</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">ID</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Rank</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Status</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">KYC</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Team</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Joined</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {membersData?.members?.map((m, i) => (
                  <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA]">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#E8EFFF] flex items-center justify-center"><User className="w-4 h-4 text-[#2962FF]" /></div>
                        <div><p className="font-medium text-[#1A237E]">{m.name}</p><p className="text-[10px] text-[#90A4AE]">{m.email}</p></div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-[#5C6BC0]">{m.memberId}</td>
                    <td className="py-3 px-2"><span className="text-xs font-medium" style={{ color: m.rankColor }}>{m.rank}</span></td>
                    <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.status === "ACTIVE" ? "bg-[#E8F5E9] text-[#4CAF50]" : m.status === "PENDING" ? "bg-[#FFF3E0] text-[#FF9800]" : "bg-[#FFEBEE] text-[#F44336]"}`}>{m.status}</span></td>
                    <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.kycStatus === "VERIFIED" ? "bg-[#E8F5E9] text-[#4CAF50]" : m.kycStatus === "PENDING" ? "bg-[#FFF3E0] text-[#FF9800]" : "bg-[#FFEBEE] text-[#F44336]"}`}>{m.kycStatus}</span></td>
                    <td className="py-3 px-2 text-right text-[#1A237E]">{m.teamSize}</td>
                    <td className="py-3 px-2 text-[#5C6BC0] text-xs">{m.joinDate ? format(new Date(m.joinDate), "dd MMM yyyy") : "-"}</td>
                    <td className="py-3 px-2 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedMember(m)}><Eye className="w-4 h-4 text-[#2962FF]" /></Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader><DialogTitle className="text-[#1A237E]">Member Details</DialogTitle></DialogHeader>
                          {selectedMember && (
                            <div className="space-y-4 pt-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-[#E8EFFF] flex items-center justify-center"><User className="w-6 h-6 text-[#2962FF]" /></div>
                                <div><h3 className="font-semibold text-[#1A237E]">{selectedMember.name}</h3><p className="text-sm text-[#5C6BC0]">{selectedMember.memberId}</p></div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 rounded-lg bg-[#F5F7FA]"><p className="text-[#90A4AE] text-xs">Rank</p><p className="font-medium text-[#1A237E]" style={{ color: selectedMember.rankColor }}>{selectedMember.rank}</p></div>
                                <div className="p-3 rounded-lg bg-[#F5F7FA]"><p className="text-[#90A4AE] text-xs">Status</p><p className="font-medium text-[#1A237E]">{selectedMember.status}</p></div>
                                <div className="p-3 rounded-lg bg-[#F5F7FA]"><p className="text-[#90A4AE] text-xs">Team Size</p><p className="font-medium text-[#1A237E]">{selectedMember.teamSize}</p></div>
                                <div className="p-3 rounded-lg bg-[#F5F7FA]"><p className="text-[#90A4AE] text-xs">Joined</p><p className="font-medium text-[#1A237E]">{selectedMember.joinDate ? format(new Date(selectedMember.joinDate), "dd MMM yyyy") : "-"}</p></div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-[#2962FF]" onClick={() => updateStatus.mutate({ id: selectedMember.id, status: "ACTIVE" })}>Activate</Button>
                                <Button size="sm" variant="outline" className="border-[#F44336] text-[#F44336]" onClick={() => updateStatus.mutate({ id: selectedMember.id, status: "INACTIVE" })}>Deactivate</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
                {(!membersData?.members || membersData.members.length === 0) && <tr><td colSpan={8} className="py-8 text-center text-[#90A4AE]">No members found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
