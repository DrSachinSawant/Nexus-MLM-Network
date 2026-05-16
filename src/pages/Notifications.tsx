import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Coins, Trophy, AlertCircle, ArrowDownToLine, Gift } from "lucide-react";
import { format } from "date-fns";

const typeIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  COMMISSION: { icon: <Coins className="w-4 h-4" />, color: "#2962FF", bg: "#E8EFFF" },
  RANK: { icon: <Trophy className="w-4 h-4" />, color: "#FFC400", bg: "#FFF8E1" },
  WITHDRAWAL: { icon: <ArrowDownToLine className="w-4 h-4" />, color: "#4CAF50", bg: "#E8F5E9" },
  SYSTEM: { icon: <AlertCircle className="w-4 h-4" />, color: "#7C4DFF", bg: "#EDE7F6" },
  REWARD: { icon: <Gift className="w-4 h-4" />, color: "#E91E63", bg: "#FCE4EC" },
};

export default function Notifications() {
  const utils = trpc.useUtils();
  const { data: notifications } = trpc.notification.getMyNotifications.useQuery({ limit: 50 });
  const markRead = trpc.notification.markAsRead.useMutation({ onSuccess: () => utils.notification.getMyNotifications.invalidate() });
  const markAllRead = trpc.notification.markAllRead.useMutation({ onSuccess: () => utils.notification.getMyNotifications.invalidate() });

  const unread = notifications?.filter(n => !n.isRead) || [];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#2962FF]" />
          Notifications
        </h1>
        <p className="text-[#5C6BC0] mt-1">Stay updated with your network activity</p>
      </div>

      <Card className="border-[#E3E8EE] shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#1A237E]">
            All Notifications ({notifications?.length || 0})
            {unread.length > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FF9800] text-white">{unread.length} new</span>}
          </CardTitle>
          {unread.length > 0 && (
            <Button variant="outline" size="sm" className="border-[#E3E8EE]" onClick={() => markAllRead.mutate()}>
              <Check className="w-4 h-4 mr-1" /> Mark all read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {notifications?.map(notif => {
              const config = typeIcons[notif.type || "SYSTEM"];
              return (
                <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${notif.isRead ? "bg-white" : "bg-[#E8EFFF]/50"} hover:bg-[#F5F7FA] transition-colors`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: config.bg, color: config.color }}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm ${notif.isRead ? "font-medium text-[#1A237E]" : "font-semibold text-[#1A237E]"}`}>{notif.title}</h3>
                      <span className="text-[10px] text-[#90A4AE] whitespace-nowrap">{notif.createdAt ? format(new Date(notif.createdAt), "dd MMM") : ""}</span>
                    </div>
                    <p className="text-xs text-[#5C6BC0] mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-[#2962FF]" onClick={() => markRead.mutate({ id: notif.id })}>
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              );
            })}
            {(!notifications || notifications.length === 0) && (
              <div className="py-8 text-center text-[#90A4AE]">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
