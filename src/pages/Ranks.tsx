import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Star, Award, Target, Gift, Crown, Diamond, Gem } from "lucide-react";

export default function Ranks() {
  const { user } = useAuth();
  const { data: ranks } = trpc.getRanks.useQuery();
  const { data: rewards } = trpc.getRewards.useQuery();
  const { data: stats } = trpc.dashboard.getStats.useQuery(undefined, { enabled: !!user });

  const currentRankId = user?.rankId || 1;
  const currentRank = ranks?.find(r => r.id === currentRankId);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#FFC400]" />
          Ranks &amp; Rewards
        </h1>
        <p className="text-[#5C6BC0] mt-1">Your rank progression and achievements</p>
      </div>

      {/* Current Rank */}
      <Card className="border-[#E3E8EE] shadow-sm mb-6 bg-gradient-to-r from-[#FFF8E1] to-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFC400] flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#5C6BC0]">Current Rank</p>
              <h2 className="text-2xl font-bold text-[#1A237E]">{currentRank?.displayName || "New Member"}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#5C6BC0]">
                <span className="flex items-center gap-1"><Target className="w-4 h-4" />{stats?.directReferrals || 0} Directs</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4" />{stats?.teamSize || 0} Team Size</span>
                <span className="flex items-center gap-1"><Gem className="w-4 h-4" />Rs. {(stats?.totalBusinessVolume || 0).toLocaleString("en-IN")} BV</span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#FFC400] flex items-center justify-center">
                <span className="text-lg font-bold text-[#1A237E]">{stats?.rankProgress || 0}%</span>
              </div>
              <p className="text-xs text-[#5C6BC0] mt-1">To Next Rank</p>
            </div>
          </div>
          <div className="w-full h-2 bg-[#E3E8EE] rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2962FF] to-[#FFC400] rounded-full transition-all" style={{ width: `${Math.min(100, stats?.rankProgress || 0)}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Rank Progression */}
      <Card className="border-[#E3E8EE] shadow-sm mb-6">
        <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2"><Award className="w-5 h-5 text-[#FFC400]" /> Rank Progression</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ranks?.map((rank, i) => {
              const isAchieved = rank.id <= currentRankId;
              const isCurrent = rank.id === currentRankId;
              return (
                <div key={rank.id} className={`flex items-center gap-4 p-3 rounded-lg ${isCurrent ? "bg-[#FFF8E1] border border-[#FFECB3]" : isAchieved ? "bg-[#E8F5E9]" : "bg-[#F5F7FA]"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isAchieved ? "text-white" : "text-[#90A4AE]"}`} style={{ backgroundColor: isAchieved ? rank.color || "#2962FF" : "#E3E8EE" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isAchieved ? "text-[#1A237E]" : "text-[#90A4AE]"}`}>{rank.displayName}</p>
                      {isCurrent && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FFC400] text-white">CURRENT</span>}
                      {isAchieved && !isCurrent && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#4CAF50] text-white">ACHIEVED</span>}
                    </div>
                    <p className="text-xs text-[#5C6BC0]">{rank.minDirects} Directs | {rank.minTeamSize} Team | Rs. {parseFloat(rank.minBusinessVolume?.toString() || "0").toLocaleString("en-IN")} BV</p>
                  </div>
                  {rank.minDirects ? (
                    <div className="text-right">
                      <p className="text-xs text-[#90A4AE]">Progress</p>
                      <p className="text-sm font-semibold" style={{ color: rank.color }}>{Math.min(100, Math.round(((stats?.directReferrals || 0) / (rank.minDirects || 1)) * 100))}%</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold text-[#1A237E] flex items-center gap-2"><Gift className="w-5 h-5 text-[#E91E63]" /> Rewards</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards?.map(reward => (
              <div key={reward.id} className="p-4 rounded-xl border border-[#E3E8EE] hover:border-[#2962FF] hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2962FF] to-[#7C4DFF] flex items-center justify-center mb-3">
                  <Diamond className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#1A237E] group-hover:text-[#2962FF]">{reward.name}</h3>
                <p className="text-xs text-[#5C6BC0] mt-1">{reward.description}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-[#90A4AE]">Direct Referrals</span><span className="font-medium text-[#1A237E]">{reward.criteria ? (typeof reward.criteria === "string" ? JSON.parse(reward.criteria).directReferrals : (reward.criteria as any).directReferrals) || 0 : 0}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[#90A4AE]">Team Business</span><span className="font-medium text-[#1A237E]">Rs. {reward.criteria ? (typeof reward.criteria === "string" ? JSON.parse(reward.criteria).teamBusiness : (reward.criteria as any).teamBusiness)?.toLocaleString("en-IN") || 0 : 0}</span></div>
                </div>
                <p className="mt-2 text-sm font-bold text-[#2962FF]">Value: Rs. {parseFloat(reward.rewardValue?.toString() || "0").toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
