import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Network from "./pages/Network";
import Genealogy from "./pages/Genealogy";
import Commissions from "./pages/Commissions";
import Wallet from "./pages/Wallet";
import Ranks from "./pages/Ranks";
import Withdrawals from "./pages/Withdrawals";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMembers from "./pages/AdminMembers";
import AdminCommissions from "./pages/AdminCommissions";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Member */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/network" element={<Network />} />
      <Route path="/genealogy" element={<Genealogy />} />
      <Route path="/commissions" element={<Commissions />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/ranks" element={<Ranks />} />
      <Route path="/withdrawals" element={<Withdrawals />} />
      <Route path="/notifications" element={<Notifications />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/members" element={<AdminMembers />} />
      <Route path="/admin/commissions" element={<AdminCommissions />} />
      <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
