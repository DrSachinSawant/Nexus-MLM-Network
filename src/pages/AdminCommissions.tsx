import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Shield, Coins, Save, Percent } from "lucide-react";
import { Navigate } from "react-router";

export default function AdminCommissions() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const { data: settings } = trpc.admin.getCommissionSettings.useQuery(undefined, { enabled: isAdmin });
  const updateMutation = trpc.admin.updateCommissionSettings.useMutation({
    onSuccess: () => utils.admin.getCommissionSettings.invalidate(),
  });

  const [edited, setEdited] = useState<Record<number, { percentage: number; isActive: boolean }>>({});

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const purchaseSettings = settings?.filter(s => s.type === "PURCHASE") || [];
  const repurchaseSettings = settings?.filter(s => s.type === "RE_PURCHASE") || [];

  const handleChange = (id: number, field: "percentage" | "isActive", value: number | boolean) => {
    setEdited(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = () => {
    const updates = Object.entries(edited).map(([id, vals]) => ({
      id: Number(id),
      percentage: vals.percentage,
      isActive: vals.isActive,
    }));
    if (updates.length > 0) {
      updateMutation.mutate({ settings: updates });
      setEdited({});
    }
  };

  const hasChanges = Object.keys(edited).length > 0;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#2962FF]" />
          Commission Settings
        </h1>
        <p className="text-[#5C6BC0] mt-1">Configure MLM commission rates</p>
      </div>

      {hasChanges && (
        <div className="mb-4 p-3 rounded-lg bg-[#FFF8E1] border border-[#FFECB3] flex items-center justify-between">
          <span className="text-sm text-[#F57F17]">You have unsaved changes</span>
          <Button size="sm" className="bg-[#2962FF]" onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-1" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Commission */}
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#2962FF]" />
              Purchase Commission (25%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchaseSettings.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#F5F7FA]">
                  <div className="w-10 h-10 rounded-lg bg-[#E8EFFF] flex items-center justify-center text-[#2962FF] font-bold text-sm">
                    {i === 0 ? "D" : `L${i}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A237E]">{i === 0 ? "Direct" : `Level ${i}`}</p>
                    <p className="text-xs text-[#90A4AE]">Commission percentage</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={parseFloat(s.percentage?.toString() || "0")}
                        onChange={e => handleChange(s.id, "percentage", parseFloat(e.target.value) || 0)}
                        className="w-20 h-9 text-right pr-6 border-[#E3E8EE]"
                      />
                      <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#90A4AE]" />
                    </div>
                    <Switch
                      checked={edited[s.id]?.isActive ?? s.isActive ?? true}
                      onCheckedChange={v => handleChange(s.id, "isActive", v)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-[#E8EFFF] text-center">
              <p className="text-xs text-[#2962FF] font-medium">
                Total: {purchaseSettings.reduce((sum, s) => sum + parseFloat(s.percentage?.toString() || "0"), 0)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Re-Purchase Commission */}
        <Card className="border-[#E3E8EE] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#4CAF50]" />
              Re-Purchase Commission (10%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repurchaseSettings.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#F5F7FA]">
                  <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center text-[#4CAF50] font-bold text-sm">
                    {i === 0 ? "D" : `L${i}`}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A237E]">{i === 0 ? "Direct" : `Level ${i}`}</p>
                    <p className="text-xs text-[#90A4AE]">Commission percentage</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={parseFloat(s.percentage?.toString() || "0")}
                        onChange={e => handleChange(s.id, "percentage", parseFloat(e.target.value) || 0)}
                        className="w-20 h-9 text-right pr-6 border-[#E3E8EE]"
                      />
                      <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#90A4AE]" />
                    </div>
                    <Switch
                      checked={edited[s.id]?.isActive ?? s.isActive ?? true}
                      onCheckedChange={v => handleChange(s.id, "isActive", v)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-[#E8F5E9] text-center">
              <p className="text-xs text-[#4CAF50] font-medium">
                Total: {repurchaseSettings.reduce((sum, s) => sum + parseFloat(s.percentage?.toString() || "0"), 0)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Summary */}
      <Card className="border-[#E3E8EE] shadow-sm mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[#1A237E]">Revenue Distribution Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#E8EFFF] text-center">
              <p className="text-2xl font-bold text-[#2962FF]">60%</p>
              <p className="text-xs text-[#5C6BC0] mt-1">Company</p>
            </div>
            <div className="p-4 rounded-xl bg-[#E8F5E9] text-center">
              <p className="text-2xl font-bold text-[#4CAF50]">25%</p>
              <p className="text-xs text-[#5C6BC0] mt-1">Purchase Commissions</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF8E1] text-center">
              <p className="text-2xl font-bold text-[#FF9800]">10%</p>
              <p className="text-xs text-[#5C6BC0] mt-1">Re-Purchase Commissions</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FCE4EC] text-center">
              <p className="text-2xl font-bold text-[#E91E63]">5%</p>
              <p className="text-xs text-[#5C6BC0] mt-1">Bonus Pools</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
