import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Eye, EyeOff, User, Lock, Mail, Phone, ArrowRight, UserPlus } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    sponsorId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      setSuccess(`Registration successful! Your Member ID is ${data.memberId}. Please login.`);
      setForm({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", sponsorId: "" });
    },
    onError: (err) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    registerMutation.mutate({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      sponsorId: form.sponsorId || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#2962FF] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFC400]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[500px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-lg mb-3">
            <Crown className="w-7 h-7 text-[#FFC400]" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
            Join Nexus Network
          </h1>
          <p className="text-white/70 mt-1">Start your journey to financial freedom</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-[#1A237E] mb-4">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 rounded-lg bg-[#FFEBEE] text-[#F44336] text-sm font-medium">{error}</div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-[#E8F5E9] text-[#4CAF50] text-sm font-medium">{success}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" className="pl-10 h-10 border-[#E3E8EE]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="pl-10 h-10 border-[#E3E8EE]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1">Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91-98765-43210" className="pl-10 h-10 border-[#E3E8EE]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1">Sponsor ID (Optional)</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input value={form.sponsorId} onChange={e => setForm({ ...form, sponsorId: e.target.value })} placeholder="NEX-2025-001" className="pl-10 h-10 border-[#E3E8EE]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="pl-10 pr-10 h-10 border-[#E3E8EE]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90A4AE]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A237E] mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
                <Input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" className="pl-10 h-10 border-[#E3E8EE]" />
              </div>
            </div>

            <Button type="submit" disabled={registerMutation.isPending} className="w-full h-10 bg-[#2962FF] hover:bg-[#1E4BD8] text-white font-semibold mt-2">
              {registerMutation.isPending ? "Creating Account..." : <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[#5C6BC0]">
            Already a member? <Link to="/login" className="text-[#2962FF] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
