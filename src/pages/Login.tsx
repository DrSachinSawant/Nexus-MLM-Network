import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.user.memberId) {
        localStorage.setItem("nexus_member_id", data.user.memberId);
        window.location.href = "/dashboard";
      }
    },
    onError: (err) => {
      setError(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!memberId.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ memberId: memberId.trim(), password });
  };

  return (
    <div className="min-h-screen bg-[#2962FF] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFC400]/10 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" />
              <line x1="0" y1="20" x2="40" y2="20" stroke="white" strokeWidth="0.5" />
              <line x1="20" y1="0" x2="20" y2="40" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[500px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4">
            <Crown className="w-8 h-8 text-[#FFC400]" />
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
            NEXUS NETWORK
          </h1>
          <p className="text-white/70 mt-2 text-lg">Your Success, Our Network</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-[#1A237E] mb-1">Sign In</h2>
          <p className="text-sm text-[#5C6BC0] mb-6">Access your member dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[#FFEBEE] text-[#F44336] text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1.5">Member ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="NEX-2025-001"
                  className="pl-10 h-11 border-[#E3E8EE] focus:border-[#2962FF] focus:ring-[#2962FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 border-[#E3E8EE] focus:border-[#2962FF] focus:ring-[#2962FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90A4AE] hover:text-[#1A237E]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-[#2962FF] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-[#2962FF] hover:bg-[#1E4BD8] text-white font-semibold"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#5C6BC0]">
            New Member?{" "}
            <Link to="/register" className="text-[#2962FF] font-medium hover:underline">
              Register here
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 text-xs mt-6">
          &copy; 2025 Nexus Network. All rights reserved.
        </p>
      </div>
    </div>
  );
}
