import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wallet as WalletIcon, ArrowRightLeft, ArrowDownToLine,
  CreditCard, Gift, PiggyBank, TrendingUp, TrendingDown,
} from "lucide-react";
import { format } from "date-fns";

const walletIcons: Record<string, React.ReactNode> = {
  MAIN: <CreditCard className="w-6 h-6" />,
  COMMISSION: <TrendingUp className="w-6 h-6" />,
  BONUS: <Gift className="w-6 h-6" />,
  REWARD: <PiggyBank className="w-6 h-6" />,
};

const walletColors: Record<string, string> = {
  MAIN: "#2962FF",
  COMMISSION: "#4CAF50",
  BONUS: "#FFC400",
  REWARD: "#9C27B0",
};

const walletLabels: Record<string, string> = {
  MAIN: "Main Wallet",
  COMMISSION: "Commission Wallet",
  BONUS: "Bonus Wallet",
  REWARD: "Reward Wallet",
};

export default function Wallet() {
  const { data: balances } = trpc.wallet.getBalances.useQuery();
  const { data: transactions } = trpc.wallet.getTransactions.useQuery({ limit: 20, offset: 0 });
  const utils = trpc.useUtils();

  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ fromType: "COMMISSION" as string, toType: "MAIN" as string, amount: "" });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "UPI" as "UPI" | "BANK", accountDetails: {} as Record<string, string> });

  const transferMutation = trpc.wallet.transfer.useMutation({
    onSuccess: () => {
      utils.wallet.getBalances.invalidate();
      utils.wallet.getTransactions.invalidate();
      setTransferOpen(false);
      setTransferForm({ fromType: "COMMISSION", toType: "MAIN", amount: "" });
    },
  });

  const withdrawMutation = trpc.wallet.requestWithdrawal.useMutation({
    onSuccess: () => {
      utils.wallet.getBalances.invalidate();
      utils.wallet.getTransactions.invalidate();
      setWithdrawOpen(false);
      setWithdrawForm({ amount: "", method: "UPI", accountDetails: {} });
    },
  });

  const mainBalance = balances?.find(w => w.type === "MAIN");
  const totalBalance = balances?.reduce((sum, w) => sum + w.balance, 0) || 0;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <WalletIcon className="w-6 h-6 text-[#2962FF]" />
          Wallet
        </h1>
        <p className="text-[#5C6BC0] mt-1">Manage your funds and transactions</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {balances?.map(wallet => (
          <Card key={wallet.type} className="border-[#E3E8EE] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${walletColors[wallet.type]}15`, color: walletColors[wallet.type] }}>
                  {walletIcons[wallet.type]}
                </div>
                <div>
                  <p className="text-xs text-[#90A4AE]">{walletLabels[wallet.type]}</p>
                  <p className="text-xl font-bold text-[#1A237E]">
                    Rs. {wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total + Actions */}
      <Card className="border-[#E3E8EE] shadow-sm mb-6 bg-gradient-to-r from-[#2962FF] to-[#1E4BD8]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm">Total Balance</p>
              <p className="text-3xl font-bold text-white">
                Rs. {totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                    <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#1A237E]">Transfer Funds</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm text-[#1A237E] mb-1 block">From</label>
                      <Select value={transferForm.fromType} onValueChange={v => setTransferForm({ ...transferForm, fromType: v })}>
                        <SelectTrigger className="border-[#E3E8EE]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {balances?.filter(w => w.type !== "MAIN").map(w => (
                            <SelectItem key={w.type} value={w.type}>{walletLabels[w.type]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-[#1A237E] mb-1 block">To</label>
                      <Select value={transferForm.toType} onValueChange={v => setTransferForm({ ...transferForm, toType: v })}>
                        <SelectTrigger className="border-[#E3E8EE]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAIN">{walletLabels.MAIN}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-[#1A237E] mb-1 block">Amount</label>
                      <Input
                        type="number"
                        value={transferForm.amount}
                        onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                        placeholder="Enter amount"
                        className="border-[#E3E8EE]"
                      />
                    </div>
                    <Button
                      className="w-full bg-[#2962FF] hover:bg-[#1E4BD8]"
                      onClick={() => transferMutation.mutate({ fromType: transferForm.fromType as "MAIN" | "COMMISSION" | "BONUS" | "REWARD", toType: transferForm.toType as "MAIN" | "COMMISSION" | "BONUS" | "REWARD", amount: parseFloat(transferForm.amount) || 0 })}
                      disabled={transferMutation.isPending || !transferForm.amount}
                    >
                      {transferMutation.isPending ? "Processing..." : "Transfer Now"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white text-[#2962FF] hover:bg-white/90">
                    <ArrowDownToLine className="w-4 h-4 mr-2" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#1A237E]">Request Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="p-3 rounded-lg bg-[#E8EFFF]">
                      <p className="text-xs text-[#5C6BC0]">Available Balance</p>
                      <p className="text-lg font-bold text-[#2962FF]">Rs. {(mainBalance?.balance || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#1A237E] mb-1 block">Amount (Min Rs. 500)</label>
                      <Input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} placeholder="500" className="border-[#E3E8EE]" />
                    </div>
                    <div>
                      <label className="text-sm text-[#1A237E] mb-1 block">Method</label>
                      <Select value={withdrawForm.method} onValueChange={v => setWithdrawForm({ ...withdrawForm, method: v as "UPI" | "BANK" })}>
                        <SelectTrigger className="border-[#E3E8EE]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="BANK">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-[#2962FF] hover:bg-[#1E4BD8]"
                      onClick={() => withdrawMutation.mutate({ amount: parseFloat(withdrawForm.amount) || 0, method: withdrawForm.method, accountDetails: {} })}
                      disabled={withdrawMutation.isPending || !(parseFloat(withdrawForm.amount) >= 500)}
                    >
                      {withdrawMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[#1A237E]">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EE]">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Description</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Type</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-[#90A4AE] uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.transactions?.map((tx, i) => (
                  <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA]">
                    <td className="py-3 px-2 text-[#1A237E]">{tx.createdAt ? format(new Date(tx.createdAt), "dd MMM yyyy") : "-"}</td>
                    <td className="py-3 px-2 text-[#1A237E]">{tx.description || "-"}</td>
                    <td className="py-3 px-2">
                      <span className="flex items-center gap-1">
                        {tx.type === "CREDIT" ? <TrendingUp className="w-3.5 h-3.5 text-[#4CAF50]" /> : <TrendingDown className="w-3.5 h-3.5 text-[#F44336]" />}
                        <span className={tx.type === "CREDIT" ? "text-[#4CAF50]" : "text-[#F44336]"}>{tx.type}</span>
                      </span>
                    </td>
                    <td className={`py-3 px-2 text-right font-semibold ${tx.type === "CREDIT" ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}Rs. {parseFloat(tx.amount?.toString() || "0").toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {(!transactions?.transactions || transactions.transactions.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-[#90A4AE]">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
