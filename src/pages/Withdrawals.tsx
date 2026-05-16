import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Withdrawals() {
  const { data: allWithdrawals } = trpc.withdrawal.getMyWithdrawals.useQuery({ limit: 50 });

  const pending = allWithdrawals?.withdrawals?.filter(w => w.status === "PENDING") || [];
  const approved = allWithdrawals?.withdrawals?.filter(w => w.status === "APPROVED" || w.status === "COMPLETED") || [];
  const rejected = allWithdrawals?.withdrawals?.filter(w => w.status === "REJECTED") || [];

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    PENDING: { icon: <Clock className="w-4 h-4" />, color: "#FF9800", label: "Pending" },
    APPROVED: { icon: <Loader2 className="w-4 h-4" />, color: "#2962FF", label: "Processing" },
    COMPLETED: { icon: <CheckCircle className="w-4 h-4" />, color: "#4CAF50", label: "Completed" },
    REJECTED: { icon: <XCircle className="w-4 h-4" />, color: "#F44336", label: "Rejected" },
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <ArrowDownToLine className="w-6 h-6 text-[#2962FF]" />
          Withdrawals
        </h1>
        <p className="text-[#5C6BC0] mt-1">Track your withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {["PENDING", "APPROVED", "COMPLETED", "REJECTED"].map(status => {
          const config = statusConfig[status];
          const count = allWithdrawals?.withdrawals?.filter(w => w.status === status).length || 0;
          return (
            <Card key={status} className="border-[#E3E8EE] shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                  {config.icon}
                </div>
                <div><p className="text-xs text-[#90A4AE]">{config.label}</p><p className="text-xl font-bold text-[#1A237E]">{count}</p></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E]">Withdrawal History</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({allWithdrawals?.withdrawals?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>

            {(["all", "pending", "completed", "rejected"] as const).map(tab => {
              const list = tab === "all" ? (allWithdrawals?.withdrawals || []) :
                tab === "pending" ? pending :
                tab === "completed" ? approved : rejected;

              return (
                <TabsContent key={tab} value={tab}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-[#E3E8EE]">
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Date</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Method</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Amount</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Fee</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Net</th>
                        <th className="text-center py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Status</th>
                      </tr></thead>
                      <tbody>
                        {list.map((w, i) => {
                          const config = statusConfig[w.status || "PENDING"];
                          return (
                            <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA]">
                              <td className="py-3 px-2 text-[#1A237E]">{w.createdAt ? format(new Date(w.createdAt), "dd MMM yyyy") : "-"}</td>
                              <td className="py-3 px-2"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E8EFFF] text-[#2962FF]">{w.method}</span></td>
                              <td className="py-3 px-2 text-right font-medium text-[#1A237E]">Rs. {parseFloat(w.amount?.toString() || "0").toLocaleString("en-IN")}</td>
                              <td className="py-3 px-2 text-right text-[#F44336]">Rs. {parseFloat(w.fee?.toString() || "0").toLocaleString("en-IN")}</td>
                              <td className="py-3 px-2 text-right font-semibold text-[#4CAF50]">Rs. {parseFloat(w.netAmount?.toString() || "0").toLocaleString("en-IN")}</td>
                              <td className="py-3 px-2 text-center"><span className="flex items-center justify-center gap-1 text-xs font-medium" style={{ color: config.color }}>{config.icon}{config.label}</span></td>
                            </tr>
                          );
                        })}
                        {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-[#90A4AE]">No withdrawals found</td></tr>}
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
