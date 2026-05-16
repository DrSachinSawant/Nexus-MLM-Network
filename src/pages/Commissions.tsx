import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Clock, CheckCircle, Filter, Download } from "lucide-react";
import { format } from "date-fns";

export default function Commissions() {
  const [period, setPeriod] = useState("all");
  const { data: summary } = trpc.commission.getSummary.useQuery({ period });
  const { data: history } = trpc.commission.getHistory.useQuery({ limit: 50, offset: 0 });

  const periods = [
    { value: "all", label: "All Time" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Coins className="w-6 h-6 text-[#2962FF]" />
          Commissions
        </h1>
        <p className="text-[#5C6BC0] mt-1">Track your earnings from the network</p>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-2 mb-4">
        {periods.map(p => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p.value)}
            className={period === p.value ? "bg-[#2962FF] text-white" : "border-[#E3E8EE] text-[#1A237E]"}
          >
            {p.label}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto border-[#E3E8EE]">
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Earnings" value={`Rs. ${(summary?.totalEarnings || 0).toLocaleString("en-IN")}`} icon={<Coins className="w-5 h-5" />} color="#2962FF" />
        <SummaryCard title="Direct Commissions" value={`Rs. ${(summary?.totalDirect || 0).toLocaleString("en-IN")}`} icon={<TrendingUp className="w-5 h-5" />} color="#4CAF50" />
        <SummaryCard title="Level Commissions" value={`Rs. ${(summary?.totalLevel || 0).toLocaleString("en-IN")}`} icon={<TrendingUp className="w-5 h-5" />} color="#FF9800" />
        <SummaryCard title="Pending" value={`Rs. ${(summary?.pendingAmount || 0).toLocaleString("en-IN")}`} icon={<Clock className="w-5 h-5" />} color="#F44336" />
      </div>

      {/* Commission History */}
      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#2962FF]" />
            Commission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EE]">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Type</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">From Member</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Level</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {history?.commissions?.map((comm, i) => (
                  <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA] transition-colors">
                    <td className="py-3 px-2 text-[#1A237E]">
                      {comm.createdAt ? format(new Date(comm.createdAt), "dd MMM yyyy") : "-"}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        comm.type === "DIRECT" ? "bg-[#E8EFFF] text-[#2962FF]" :
                        comm.type === "LEVEL" ? "bg-[#E8F5E9] text-[#4CAF50]" :
                        "bg-[#FFF8E1] text-[#FF9800]"
                      }`}>
                        {comm.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#1A237E]">{comm.fromMemberName || "-"}</td>
                    <td className="py-3 px-2 text-[#5C6BC0]">L{comm.level}</td>
                    <td className="py-3 px-2 text-right font-semibold text-[#4CAF50]">
                      +Rs. {parseFloat(comm.amount?.toString() || "0").toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {comm.status === "PAID" ? (
                        <CheckCircle className="w-4 h-4 text-[#4CAF50] inline" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#FF9800] inline" />
                      )}
                    </td>
                  </tr>
                ))}
                {(!history?.commissions || history.commissions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#90A4AE]">No commission records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-[#E3E8EE] shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <p className="text-xs text-[#90A4AE] uppercase tracking-wider">{title}</p>
            <p className="text-lg font-bold text-[#1A237E]">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
