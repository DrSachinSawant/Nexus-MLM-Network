import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Crown, Users, DollarSign, Shield, TrendingUp, Award, ArrowRight, CheckCircle, Star, GitBranch, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E3E8EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#FFC400]" />
              <span className="font-bold text-xl text-[#2962FF]" style={{ fontFamily: "Playfair Display, serif" }}>NEXUS</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-[#5C6BC0] hover:text-[#2962FF]">Features</a>
              <a href="#plan" className="text-sm text-[#5C6BC0] hover:text-[#2962FF]">Compensation</a>
              <a href="#packages" className="text-sm text-[#5C6BC0] hover:text-[#2962FF]">Packages</a>
              <Link to="/login">
                <Button variant="outline" className="border-[#2962FF] text-[#2962FF]">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#2962FF] hover:bg-[#1E4BD8]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-[#2962FF] via-[#2962FF] to-[#1E4BD8] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFC400]/10 rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 1000">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" /></pattern></defs>
            <rect width="1000" height="1000" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm mb-6">
            <Star className="w-4 h-4 text-[#FFC400]" />
            India&apos;s Most Trusted MLM Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            Build Your Network.<br />
            <span className="text-[#FFC400]">Grow Your Wealth.</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Join Nexus Network and unlock unlimited earning potential with our 7-level unilevel compensation plan. Start your journey to financial freedom today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-[#2962FF] hover:bg-white/90 font-semibold px-8">
                Join Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8">
                Member Login
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div><p className="text-3xl font-bold text-white">10K+</p><p className="text-sm text-white/60">Members</p></div>
            <div><p className="text-3xl font-bold text-white">5Cr+</p><p className="text-sm text-white/60">Paid Out</p></div>
            <div><p className="text-3xl font-bold text-white">7</p><p className="text-sm text-white/60">Levels Deep</p></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A237E]">Why Choose Nexus Network?</h2>
            <p className="text-[#5C6BC0] mt-2">Everything you need to build a successful network marketing business</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<GitBranch className="w-6 h-6" />} title="7-Level Unilevel Plan" desc="Earn commissions up to 7 levels deep with our proven compensation structure." color="#2962FF" />
            <FeatureCard icon={<DollarSign className="w-6 h-6" />} title="35% Total Distribution" desc="40% of every sale goes back to the network through commissions and bonuses." color="#4CAF50" />
            <FeatureCard icon={<Wallet className="w-6 h-6" />} title="Multiple Wallets" desc="Separate wallets for commissions, bonuses, rewards, and main balance." color="#FF9800" />
            <FeatureCard icon={<Shield className="w-6 h-6" />} title="Secure Platform" desc="Bank-level security with KYC verification and encrypted transactions." color="#7C4DFF" />
            <FeatureCard icon={<TrendingUp className="w-6 h-6" />} title="Real-time Analytics" desc="Track your growth with detailed reports and live dashboard updates." color="#00BCD4" />
            <FeatureCard icon={<Award className="w-6 h-6" />} title="Rank Rewards" desc="Unlock exclusive rewards as you advance through 10 achievement ranks." color="#E91E63" />
          </div>
        </div>
      </section>

      {/* Compensation Plan */}
      <section id="plan" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A237E]">Compensation Plan</h2>
            <p className="text-[#5C6BC0] mt-2">Transparent and generous commission structure</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-[#F5F7FA]">
              <h3 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#2962FF]" /> Purchase Commission (25%)</h3>
              <div className="space-y-2">
                {[{ l: "Direct", p: "10%" }, { l: "Level 1", p: "5%" }, { l: "Level 2", p: "2.5%" }, { l: "Level 3", p: "2.5%" }, { l: "Level 4", p: "2%" }, { l: "Level 5", p: "2%" }, { l: "Level 6", p: "1%" }].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#E3E8EE] last:border-0">
                    <span className="text-sm text-[#1A237E]">{r.l}</span>
                    <span className="text-sm font-semibold text-[#2962FF]">{r.p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-[#F5F7FA]">
              <h3 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#4CAF50]" /> Re-Purchase Commission (10%)</h3>
              <div className="space-y-2">
                {[{ l: "Direct", p: "5%" }, { l: "Level 1", p: "2%" }, { l: "Level 2", p: "1%" }, { l: "Level 3", p: "1%" }, { l: "Level 4", p: "0.5%" }, { l: "Level 5", p: "0.25%" }, { l: "Level 6", p: "0.25%" }].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#E3E8EE] last:border-0">
                    <span className="text-sm text-[#1A237E]">{r.l}</span>
                    <span className="text-sm font-semibold text-[#4CAF50]">{r.p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 px-4 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A237E]">Join Packages</h2>
            <p className="text-[#5C6BC0] mt-2">Choose the package that fits your goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PackageCard name="Starter" price="1,999" bv="1,000" features={["Basic Training", "Digital Kit", "Community Access"]} color="#2962FF" popular={false} />
            <PackageCard name="Premium" price="4,999" bv="3,000" features={["Advanced Training", "Marketing Materials", "Priority Support", "Weekly Webinars"]} color="#FFC400" popular={true} />
            <PackageCard name="Elite" price="9,999" bv="7,000" features={["Executive Training", "Done-for-you Marketing", "1-on-1 Mentorship", "VIP Events", "International Trips"]} color="#E91E63" popular={false} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#2962FF] to-[#1E4BD8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>Ready to Start Your Journey?</h2>
          <p className="text-white/80 mt-4 text-lg">Join thousands of successful network marketers who have transformed their lives with Nexus Network.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"><Button size="lg" className="bg-white text-[#2962FF] hover:bg-white/90 font-semibold px-8">Join Nexus Network</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8">Member Login</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#1A237E]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-[#FFC400]" />
            <span className="font-bold text-xl text-white" style={{ fontFamily: "Playfair Display, serif" }}>NEXUS NETWORK</span>
          </div>
          <p className="text-white/50 text-sm">Your Success, Our Network. Building wealth together.</p>
          <p className="text-white/30 text-xs mt-6">&copy; 2025 Nexus Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="p-6 rounded-xl bg-white border border-[#E3E8EE] hover:border-[#2962FF] hover:shadow-lg transition-all group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
      <h3 className="font-semibold text-[#1A237E] mb-2 group-hover:text-[#2962FF] transition-colors">{title}</h3>
      <p className="text-sm text-[#5C6BC0]">{desc}</p>
    </div>
  );
}

function PackageCard({ name, price, bv, features, color, popular }: { name: string; price: string; bv: string; features: string[]; color: string; popular: boolean }) {
  return (
    <div className={`relative p-6 rounded-2xl bg-white border-2 transition-all hover:shadow-xl ${popular ? "border-[#FFC400] shadow-lg" : "border-[#E3E8EE]"}`}>
      {popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-[#FFC400] text-white">MOST POPULAR</span>}
      <h3 className="text-lg font-semibold text-[#1A237E]">{name}</h3>
      <div className="mt-4 mb-6">
        <span className="text-3xl font-bold" style={{ color }}>Rs. {price}</span>
        <span className="text-sm text-[#90A4AE] ml-2">/ one-time</span>
      </div>
      <p className="text-sm text-[#5C6BC0] mb-4">Business Volume: {bv}</p>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-[#1A237E]">
            <CheckCircle className="w-4 h-4 text-[#4CAF50]" /> {f}
          </li>
        ))}
      </ul>
      <Link to="/register" className="block">
        <Button className="w-full font-semibold" style={{ backgroundColor: color, color: "white" }}>
          Choose {name}
        </Button>
      </Link>
    </div>
  );
}
