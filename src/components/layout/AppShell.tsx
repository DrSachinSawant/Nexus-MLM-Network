import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Coins,
  Wallet,
  Trophy,
  ArrowDownToLine,
  MessageCircle,
  Settings,
  Shield,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Crown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const memberNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Network", icon: Users, path: "/network" },
  { label: "Genealogy Tree", icon: GitBranch, path: "/genealogy" },
  { label: "Commissions", icon: Coins, path: "/commissions" },
  { label: "Wallet", icon: Wallet, path: "/wallet" },
  { label: "Ranks & Rewards", icon: Trophy, path: "/ranks" },
  { label: "Withdrawals", icon: ArrowDownToLine, path: "/withdrawals" },
  { label: "Support", icon: MessageCircle, path: "/support" },
];

const adminNav = [
  { label: "Admin Dashboard", icon: Shield, path: "/admin" },
  { label: "Members", icon: Users, path: "/admin/members" },
  { label: "Commission Settings", icon: Coins, path: "/admin/commissions" },
  { label: "Withdrawal Requests", icon: ArrowDownToLine, path: "/admin/withdrawals" },
  { label: "System Settings", icon: Settings, path: "/admin/settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount } = trpc.notification.getMyNotifications.useQuery(
    { unreadOnly: true, limit: 100 },
    { enabled: !!user }
  );

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E3E8EE] z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F5F7FA]"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-[#1A237E]" /> : <Menu className="w-5 h-5 text-[#1A237E]" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#FFC400]" />
            <span className="font-bold text-xl text-[#2962FF]" style={{ fontFamily: "Playfair Display, serif" }}>
              NEXUS
            </span>
          </Link>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center text-sm text-[#90A4AE]">
          <Link to="/" className="hover:text-[#2962FF]">Home</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-[#5C6BC0]">{location.pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}</span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              {user.rankName && (
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF8E1] text-[#F57F17] border border-[#FFECB3]">
                  <Star className="w-3 h-3" />
                  {user.rankName}
                </span>
              )}
              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-[#F5F7FA]">
                <Bell className="w-5 h-5 text-[#1A237E]" />
                {unreadCount && unreadCount.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#FF9800] text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                    {unreadCount.length}
                  </span>
                )}
              </Link>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-[#F5F7FA] text-[#2962FF]" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-[#E3E8EE] z-40 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-1">
          {/* Member Section */}
          <div className="text-xs font-semibold text-[#90A4AE] uppercase tracking-wider px-3 py-2">
            Member Area
          </div>
          {memberNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-[#E8EFFF] text-[#2962FF] border-l-[3px] border-[#2962FF]"
                  : "text-[#1A237E] hover:bg-[#F5F7FA]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="mt-6 text-xs font-semibold text-[#90A4AE] uppercase tracking-wider px-3 py-2">
                Admin Panel
              </div>
              {adminNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-[#E8EFFF] text-[#2962FF] border-l-[3px] border-[#2962FF]"
                      : "text-[#1A237E] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6 max-w-[1400px]">{children}</div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
