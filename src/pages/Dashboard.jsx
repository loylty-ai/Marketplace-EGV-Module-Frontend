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
    <div className="w-full p-6 flex flex-col gap-6 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome, {user.username}
          </h1>
          <p className="text-sm text-neutral-600">
            Your control center for the voucher operating system
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1 text-xs font-medium">
          <Sparkles size={16} />
          3 AI recommendations
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Banks"
          value={banksCount}
          change={`${newBanksCount} this month`}
          icon={<Building2 className="text-emerald-600" size={20} />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Active Vendors"
          value={vendorsCount}
          change={`${newVendorsCount} this month`}
          icon={<TrendingUp className="text-blue-600" size={20} />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Active Cards"
          value={cardsCount}
          change={`${newCardsCount} this month`}
          icon={<CreditCard className="text-purple-600" size={20} />}
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Total Products"
          value={vouchersCount}
          change={`${newVouchersCount} this month`}
          icon={<Package className="text-amber-600" size={20} />}
          iconBg="bg-amber-50"
        />
      </div>

      <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">
              AI Recommendations
            </p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-md">
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
    <div className="bg-white shadow-md hover:shadow-lg border border-neutral-200 rounded-xl p-4 flex justify-between items-center">
      <div>
        <p className="text-xs text-neutral-500">{title}</p>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="flex items-center justify-center gap-2 text-xs text-emerald-600 mt-1"><TrendingUp size={16} />{change}</p>
      </div>

      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}

function PlatformHealth() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-sm font-medium text-neutral-900 mb-6">
        Platform Health
      </h3>

      <Progress
        label="Configuration Completeness"
        value={78}
        color="bg-amber-500"
        desc="35 of 45 cards fully configured"
      />
      <Progress
        label="Vendor Integration Health"
        value={96}
        color="bg-emerald-500"
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
    <div className="mb-6">
      <div className="flex justify-between text-xs font-medium text-neutral-900">
        <span>{label}</span>
        <span className="text-lg font-bold">{value}%</span>
      </div>

      <div className="w-full bg-neutral-100 rounded-full h-2 mt-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>

      <p className="text-xs text-neutral-500 mt-1">{desc}</p>
    </div>
  );
}

function QuickWins() {
  const items = [
    {
      title: "Add card tiers to ICICI Coral",
      desc: "Unlock tiered pricing • 5 min",
    },
    {
      title: "Update Axis Bank contact details",
      desc: "Keep records current • 2 min",
    },
    {
      title: "Review 3 pending audit logs",
      desc: "Ensure compliance • 8 min",
    },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-sm font-medium text-neutral-900 mb-6">
        Quick Wins
      </h3>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-neutral-50 border border-neutral-200 rounded-lg p-3"
          >
            <p className="text-xs font-medium text-neutral-900">
              {item.title}
            </p>
            <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-sm font-medium text-neutral-900 mb-6">
        System Status
      </h3>

      <StatusItem
        title="API Services"
        desc="All operational"
        success
      />
      <StatusItem
        title="Vendor Integrations"
        desc="28/28 active"
        success
      />
      <StatusItem
        title="Product Sync"
        desc="In progress..."
        warning
      />
    </div>
  );
}

function StatusItem({ title, desc, success, warning }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border mb-3 ${
        success
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      {success && (
        <CheckCircle2 className="text-emerald-600" size={16} />
      )}
      {warning && (
        <AlertTriangle className="text-amber-600" size={16} />
      )}

      <div>
        <p className="text-xs font-medium text-neutral-900">
          {title}
        </p>
        <p className="text-xs text-neutral-600">{desc}</p>
      </div>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    {
      title: "New vendor added",
      desc: "Qwikcilver",
      time: "2 hours ago",
      color: "bg-emerald-500",
    },
    {
      title: "Pricing rule updated",
      desc: "SBI Platinum - 15%",
      time: "4 hours ago",
      color: "bg-blue-500",
    },
    {
      title: "Bank-Vendor config",
      desc: "ICICI & VoucherGram",
      time: "6 hours ago",
      color: "bg-blue-500",
    },
    {
      title: "Product catalog sync",
      desc: "Amazon Vouchers",
      time: "8 hours ago",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <h3 className="text-sm font-medium text-neutral-900 mb-6">
        Recent Activity
      </h3>

      <div className="flex flex-col gap-3">
        {activities.map((a, i) => (
          <div
            key={i}
            className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex gap-3"
          >
            <div
              className={`w-2 h-2 mt-2 rounded-full ${a.color}`}
            />
            <div>
              <p className="text-xs font-medium text-neutral-900">
                {a.title}
              </p>
              <p className="text-xs text-neutral-600">{a.desc}</p>
              <p className="text-xs text-neutral-400">
                {a.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
