import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import { format } from "date-fns";
import { Navigate } from "react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminWithdrawals() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const { data: pendingWithdrawals } = trpc.withdrawal.getPending.useQuery(undefined, { enabled: isAdmin });
  const { data: recentWithdrawals } = trpc.admin.getRecentWithdrawals.useQuery({ limit: 50 }, { enabled: isAdmin });
  const approveMutation = trpc.withdrawal.approve.useMutation({ onSuccess: () => { utils.withdrawal.getPending.invalidate(); utils.admin.getRecentWithdrawals.invalidate(); } });
  const rejectMutation = trpc.withdrawal.reject.useMutation({ onSuccess: () => { utils.withdrawal.getPending.invalidate(); utils.admin.getRecentWithdrawals.invalidate(); } });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const all = recentWithdrawals || [];
  const pending = all.filter(w => w.status === "PENDING");
  const completed = all.filter(w => w.status === "COMPLETED" || w.status === "APPROVED");
  const rejected = all.filter(w => w.status === "REJECTED");

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode }> = {
      PENDING: { cls: "bg-[#FFF3E0] text-[#FF9800]", icon: <Clock className="w-3 h-3" /> },
      APPROVED: { cls: "bg-[#E8EFFF] text-[#2962FF]", icon: <CheckCircle className="w-3 h-3" /> },
      COMPLETED: { cls: "bg-[#E8F5E9] text-[#4CAF50]", icon: <CheckCircle className="w-3 h-3" /> },
      REJECTED: { cls: "bg-[#FFEBEE] text-[#F44336]", icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] || map.PENDING;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>{s.icon}{status}</span>;
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#2962FF]" />
          Withdrawal Requests
        </h1>
        <p className="text-[#5C6BC0] mt-1">Approve or reject member withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-[#E3E8EE]"><CardContent className="p-4"><p className="text-xs text-[#90A4AE]">Pending</p><p className="text-2xl font-bold text-[#FF9800]">{pending.length}</p></CardContent></Card>
        <Card className="border-[#E3E8EE]"><CardContent className="p-4"><p className="text-xs text-[#90A4AE]">Total Amount</p><p className="text-2xl font-bold text-[#2962FF]">Rs. {pending.reduce((s, w) => s + parseFloat(w.amount?.toString() || "0"), 0).toLocaleString("en-IN")}</p></CardContent></Card>
        <Card className="border-[#E3E8EE]"><CardContent className="p-4"><p className="text-xs text-[#90A4AE]">Completed</p><p className="text-2xl font-bold text-[#4CAF50]">{completed.length}</p></CardContent></Card>
        <Card className="border-[#E3E8EE]"><CardContent className="p-4"><p className="text-xs text-[#90A4AE]">Rejected</p><p className="text-2xl font-bold text-[#F44336]">{rejected.length}</p></CardContent></Card>
      </div>

      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E]">Withdrawal Requests</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="all">All ({all.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            {(["pending", "all", "completed", "rejected"] as const).map(tab => {
              const list = tab === "pending" ? pending : tab === "all" ? all : tab === "completed" ? completed : rejected;
              return (
                <TabsContent key={tab} value={tab}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-[#E3E8EE]">
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Member</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Date</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Method</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Amount</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Net</th>
                        <th className="text-center py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Status</th>
                        {tab === "pending" && <th className="text-center py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Actions</th>}
                      </tr></thead>
                      <tbody>
                        {list.map((w, i) => (
                          <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA]">
                            <td className="py-3 px-2"><div><p className="font-medium text-[#1A237E]">{w.memberName || "-"}</p><p className="text-[10px] text-[#90A4AE]">{w.memberId}</p></div></td>
                            <td className="py-3 px-2 text-[#5C6BC0] text-xs">{w.createdAt ? format(new Date(w.createdAt), "dd MMM yyyy HH:mm") : "-"}</td>
                            <td className="py-3 px-2"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E8EFFF] text-[#2962FF]">{w.method}</span></td>
                            <td className="py-3 px-2 text-right font-medium text-[#1A237E]">Rs. {parseFloat(w.amount?.toString() || "0").toLocaleString("en-IN")}</td>
                            <td className="py-3 px-2 text-right text-[#4CAF50]">Rs. {parseFloat(w.netAmount?.toString() || "0").toLocaleString("en-IN")}</td>
                            <td className="py-3 px-2 text-center">{statusBadge(w.status || "PENDING")}</td>
                            {tab === "pending" && (
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center gap-1 justify-center">
                                  <Button size="sm" className="h-7 px-2 text-xs bg-[#4CAF50] hover:bg-[#388E3C]" onClick={() => approveMutation.mutate({ id: w.id })}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                  </Button>
                                  <Dialog open={rejectingId === w.id} onOpenChange={o => setRejectingId(o ? w.id : null)}>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-[#F44336] text-[#F44336]"><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[350px]">
                                      <DialogHeader><DialogTitle>Reject Withdrawal</DialogTitle></DialogHeader>
                                      <div className="space-y-3 pt-3">
                                        <Input placeholder="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="border-[#E3E8EE]" />
                                        <Button className="w-full bg-[#F44336] hover:bg-[#D32F2F]" onClick={() => { rejectMutation.mutate({ id: w.id, remarks: rejectReason }); setRejectingId(null); }}>Confirm Rejection</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                        {list.length === 0 && <tr><td colSpan={tab === "pending" ? 7 : 6} className="py-8 text-center text-[#90A4AE]">No withdrawals found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </AppShell>
  );
}
