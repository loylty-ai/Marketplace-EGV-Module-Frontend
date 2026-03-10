import {
  TrendingUp,
  CreditCard,
  Building2,
  Package,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {

  const { user } = useAuth();

  const [banksCount, setBanksCount] = useState(0);
  const [newBanksCount, setNewBanksCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);

  const [newVendorsCount, setNewVendorsCount] = useState(0);
  const [cardsCount, setCardsCount] = useState(0);
  const [newCardsCount, setNewCardsCount] = useState(0);

  const [loading, setLoading] = useState(0);

  const fetchBanksCount = () => {
    api.get("/banks/count").then((res) =>  setBanksCount(res.data.data || 0)).catch(() => setBanksCount(0)).finally(() => setLoading(false));
  }

  const fetchBanksMonthCount = () => {
    api.get("/banks/count/this-month").then((res) => setNewBanksCount(res.data.data || 0)).catch(() => setNewBanksCount(0)).finally(() => setLoading(false));
  }

  // Cards total count
  const fetchCardsCount = () => {
    api.get("/cards/count")
      .then((res) => setCardsCount(res.data.data || 0))
      .catch(() => setCardsCount(0))
      .finally(() => setLoading(false));
  }

  // Cards created this month count
  const fetchCardsMonthCount = () => {
    api.get("/cards/count/this-month")
      .then((res) => setNewCardsCount(res.data.data || 0))
      .catch(() => setNewCardsCount(0))
      .finally(() => setLoading(false));
  }

  // Vouchers total count
  const [vouchersCount, setVouchersCount] = useState(0);
  const [newVouchersCount, setNewVouchersCount] = useState(0);

  const fetchVouchersCount = () => {
    api.get("/vouchers/count")
      .then((res) => setVouchersCount(res.data || 0))
      .catch(() => setVouchersCount(0))
      .finally(() => setLoading(false));
  }

  // Vouchers created this month count
  const fetchVouchersMonthCount = () => {
    api.get("/vouchers/count/this-month")
      .then((res) => setNewVouchersCount(res.data || 0))
      .catch(() => setNewVouchersCount(0))
      .finally(() => setLoading(false));
  }

  // Vendors total count
  const fetchVendorsCount = () => {
    api.get("/vendors/count")
      .then((res) => setVendorsCount(res.data.data || 0))
      .catch(() => setVendorsCount(0))
      .finally(() => setLoading(false));
  }

  // Vendors created this month count
  const fetchVendorsMonthCount = () => {
    api.get("/vendors/count/this-month")
      .then((res) => setNewVendorsCount(res.data.data || 0))
      .catch(() => setNewVendorsCount(0))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBanksCount();
    fetchBanksMonthCount();
    fetchCardsCount();
    fetchCardsMonthCount();
    fetchVouchersCount();
    fetchVouchersMonthCount();
    fetchVendorsCount();
    fetchVendorsMonthCount();
  }, []);

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Welcome, {user.username}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your control center for the voucher operating system
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-medium">
          <Sparkles size={14} className="shrink-0" />
          3 AI recommendations
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Banks"
          value={banksCount}
          change={`${newBanksCount} this month`}
          icon={<Building2 className="text-primary" size={20} />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Active Vendors"
          value={vendorsCount}
          change={`${newVendorsCount} this month`}
          icon={<TrendingUp className="text-blue-600" size={20} />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          title="Active Cards"
          value={cardsCount}
          change={`${newCardsCount} this month`}
          icon={<CreditCard className="text-violet-600" size={20} />}
          iconBg="bg-violet-500/10"
        />
        <StatCard
          title="Total Products"
          value={vouchersCount}
          change={`${newVouchersCount} this month`}
          icon={<Package className="text-amber-600" size={20} />}
          iconBg="bg-amber-500/10"
        />
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between transition-colors duration-fast">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-card">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-semibold text-foreground">AI Recommendations</p>
            <p className="text-xs text-muted-foreground mt-0.5">Personalized insights for your workflow</p>
          </div>
          <span className="text-xs bg-primary/15 text-primary font-medium px-2.5 py-1 rounded-md border border-primary/20">
            3 insights
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PlatformHealth />
        <QuickWins />
        <SystemStatus />
      </div>

      <RecentActivity />
    </div>
  );
}

function StatCard({ title, value, change, icon, iconBg }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex justify-between items-center shadow-card hover:shadow-elevated transition-shadow duration-normal">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
        <p className="flex items-center gap-1.5 text-xs text-primary font-medium mt-2">
          <TrendingUp size={14} />
          {change}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

function PlatformHealth() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-6">Platform Health</h3>
      <Progress
        label="Configuration Completeness"
        value={78}
        color="bg-amber-500"
        desc="35 of 45 cards fully configured"
      />
      <Progress
        label="Vendor Integration Health"
        value={96}
        color="bg-primary"
        desc="27 of 28 vendors active"
      />
      <Progress
        label="Product Coverage"
        value={84}
        color="bg-blue-500"
        desc="156 products across 28 vendors"
      />
    </div>
  );
}

function Progress({ label, value, color, desc }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between text-sm font-medium text-foreground">
        <span>{label}</span>
        <span className="font-bold tabular-nums">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 mt-2 overflow-hidden">
        <div
          className={`${color} h-2.5 rounded-full transition-[width] duration-normal`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">{desc}</p>
    </div>
  );
}

function QuickWins() {
  const items = [
    { title: "Add card tiers to ICICI Coral", desc: "Unlock tiered pricing • 5 min" },
    { title: "Update Axis Bank contact details", desc: "Keep records current • 2 min" },
    { title: "Review 3 pending audit logs", desc: "Ensure compliance • 8 min" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-6">Quick Wins</h3>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-muted/50 border border-border rounded-lg p-3.5 hover:bg-muted/70 transition-colors duration-fast"
          >
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-6">System Status</h3>
      <div className="flex flex-col gap-2">
        <StatusItem title="API Services" desc="All operational" success />
        <StatusItem title="Vendor Integrations" desc="28/28 active" success />
        <StatusItem title="Product Sync" desc="In progress..." warning />
      </div>
    </div>
  );
}

function StatusItem({ title, desc, success, warning }) {
  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-lg border ${
        success ? "bg-primary/10 border-primary/20" : "bg-amber-500/10 border-amber-500/20"
      }`}
    >
      {success && <CheckCircle2 className="text-primary shrink-0" size={18} />}
      {warning && <AlertTriangle className="text-amber-600 shrink-0" size={18} />}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    { title: "New vendor added", desc: "Qwikcilver", time: "2 hours ago", color: "bg-primary" },
    { title: "Pricing rule updated", desc: "SBI Platinum - 15%", time: "4 hours ago", color: "bg-blue-500" },
    { title: "Bank-Vendor config", desc: "ICICI & VoucherGram", time: "6 hours ago", color: "bg-blue-500" },
    { title: "Product catalog sync", desc: "Amazon Vouchers", time: "8 hours ago", color: "bg-amber-500" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <h3 className="text-base font-semibold text-foreground mb-6">Recent Activity</h3>
      <div className="flex flex-col gap-2">
        {activities.map((a, i) => (
          <div
            key={i}
            className="bg-muted/50 border border-border rounded-lg p-3.5 flex gap-3 hover:bg-muted/70 transition-colors duration-fast"
          >
            <div className={`w-2.5 h-2.5 mt-1 rounded-full shrink-0 ${a.color}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
