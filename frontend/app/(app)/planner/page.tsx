"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Plane,
  Building2,
  AlertTriangle,
  RefreshCw,
  Calculator,
  Sparkles,
  Shield,
  Info,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  name: string;
  type: string;
  mask: string;
  balance: number;
  institution: string;
}

interface Stock {
  ticker: string;
  name: string;
  reason: string;
  price: number;
  change: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  peRatio: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function fmtCap(num: number) {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  return `$${(num / 1e6).toFixed(2)}M`;
}

function compound(principal: number, ratePercent: number, years: number) {
  return principal * Math.pow(1 + ratePercent / 100, years);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AllocationCard({
  icon,
  label,
  amount,
  percent,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  percent: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <p className="text-xs text-muted leading-tight">{label}</p>
      <p className="text-xl font-black text-foreground">{fmt(amount)}</p>
      <p className="text-xs text-muted">{percent}% of surplus</p>
    </div>
  );
}

function StockRow({
  stock,
  investableAmount,
  isExpanded,
  onToggle,
}: {
  stock: Stock;
  investableAmount: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [investAmt, setInvestAmt] = useState(String(Math.round(investableAmount)));
  const [years, setYears] = useState("5");
  const [rate, setRate] = useState("7");

  const principal = parseFloat(investAmt) || 0;
  const r = parseFloat(rate) || 7;
  const t = parseFloat(years) || 5;
  const total = compound(principal, r, t);
  const gain = total - principal;

  const isUp = stock.change >= 0;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isExpanded ? "border-accent-2 bg-accent-2/5" : "border-border bg-card hover:border-accent-2/40"
      }`}
    >
      {/* Row header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-4"
      >
        {/* Ticker badge */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-input-bg font-black text-xs text-foreground">
          {stock.ticker.slice(0, 4)}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm">{stock.ticker}</p>
          <p className="text-xs text-muted truncate">{stock.name}</p>
        </div>

        {/* Price + change */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-foreground text-sm">${stock.price.toFixed(2)}</p>
          <p
            className={`text-xs font-semibold ${
              isUp
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isUp ? "+" : ""}
            {stock.change.toFixed(2)}%
          </p>
        </div>

        {/* Expand indicator */}
        <div className="ml-2 flex-shrink-0 text-muted">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* Reason — always visible below header */}
      {!isExpanded && (
        <p className="px-4 pb-3 text-xs text-muted">{stock.reason}</p>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 space-y-4">
              <p className="text-xs text-muted">{stock.reason}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-muted mb-0.5">Market Cap</p>
                  <p className="font-semibold text-foreground">{fmtCap(stock.marketCap)}</p>
                </div>
                <div>
                  <p className="text-muted mb-0.5">P/E Ratio</p>
                  <p className="font-semibold text-foreground">
                    {stock.peRatio ? stock.peRatio.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-0.5">52W High</p>
                  <p className="font-semibold text-foreground">
                    ${stock.fiftyTwoWeekHigh.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Compound interest calculator */}
              <div className="bg-input-bg rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator size={12} /> Compound Interest Calculator
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted block mb-1">Invest Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">$</span>
                      <input
                        type="number"
                        value={investAmt}
                        onChange={(e) => setInvestAmt(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-6 pr-2 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-accent-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Years</label>
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-accent-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Annual Return %</label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-accent-2"
                    />
                  </div>
                </div>

                {/* Projection results */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted mb-1">Principal</p>
                    <p className="font-black text-foreground text-sm">{fmt(principal)}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
                    <p className="text-xs text-muted mb-1">Estimated Gain</p>
                    <p className="font-black text-green-600 dark:text-green-400 text-sm">
                      +{fmt(gain)}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent-2/10 border border-accent-2/20">
                    <p className="text-xs text-muted mb-1">Total Value</p>
                    <p className="font-black text-accent-2 text-sm">{fmt(total)}</p>
                  </div>
                </div>

                {/* Timeline preview */}
                <div className="pt-1">
                  <p className="text-xs text-muted mb-2">Year-by-year projection</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[1, 2, 3, 5, 10].map((yr) => {
                      const val = compound(principal, r, yr);
                      return (
                        <div
                          key={yr}
                          className="flex-shrink-0 text-center px-3 py-2 rounded-lg bg-card border border-border"
                        >
                          <p className="text-xs text-muted">{yr}Y</p>
                          <p className="text-xs font-bold text-foreground">{fmt(val)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-muted">
                  * Estimates only. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const [connected, setConnected] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const [sp500, setSp500] = useState<Stock[]>([]);
  const [sp500Loading, setSp500Loading] = useState(false);
  const [sp500Error, setSp500Error] = useState(false);

  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const expenses = parseFloat(monthlyExpenses) || 0;
  const surplus = totalBalance - expenses;
  const hasSurplus = surplus > 0;

  // Recommended allocations when in surplus
  const allocations = analyzed && hasSurplus
    ? {
        emergency: Math.round(surplus * 0.2),
        vacation: Math.round(surplus * 0.1),
        investment: Math.round(surplus * 0.5),
        misc: Math.round(surplus * 0.2),
      }
    : null;

  const investableAmount = allocations?.investment ?? 500;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const connectBank = async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch("/api/planner/accounts");
      const data = await res.json();
      setAccounts(data.accounts);
      setIsDemo(data.demo ?? false);
    } catch {
      // Inline fallback if API is unreachable during dev
      setAccounts([
        { id: "1", name: "Checking Account", type: "checking", mask: "4567", balance: 4250, institution: "Chase Bank" },
        { id: "2", name: "High-Yield Savings", type: "savings", mask: "8901", balance: 12800, institution: "Chase Bank" },
      ]);
      setIsDemo(true);
    } finally {
      setAccountsLoading(false);
      setConnected(true);
    }
  };

  const fetchSP500 = async () => {
    setSp500Loading(true);
    setSp500Error(false);
    try {
      const res = await fetch("/api/planner/sp500");
      if (!res.ok) throw new Error("bad response");
      setSp500(await res.json());
    } catch {
      setSp500Error(true);
    } finally {
      setSp500Loading(false);
    }
  };

  const analyze = () => {
    if (!monthlyExpenses || expenses <= 0) return;
    setAnalyzed(true);
    fetchSP500();
  };

  const resetExpenses = () => {
    setAnalyzed(false);
    setMonthlyExpenses("");
    setSp500([]);
    setExpandedStock(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Financial Planner</h1>
          <p className="mt-1 text-muted text-sm">
            Connect your bank · Analyze finances · Get personalized investment recommendations
          </p>
        </div>
        {isDemo && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex-shrink-0 ml-4">
            <Info size={11} /> Demo Mode
          </span>
        )}
      </div>

      {/* ── Step 1: Connect Bank ── */}
      {!connected ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-10 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-2/10">
            <Building2 size={30} className="text-accent-2" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Connect Your Bank Account</h2>
          <p className="text-muted text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            Link your checking and savings accounts to see your total balance and receive
            personalized investment recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={connectBank}
              disabled={accountsLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-2 text-white font-semibold hover:bg-accent-2/90 transition-colors disabled:opacity-50"
            >
              {accountsLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Wallet size={16} />
              )}
              {accountsLoading ? "Connecting…" : "Connect with Plaid"}
            </button>
            <button
              onClick={connectBank}
              disabled={accountsLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-input-bg transition-colors disabled:opacity-50"
            >
              <BarChart3 size={16} />
              Try with Demo Data
            </button>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Shield size={11} />
            Bank-level encryption · Read-only access · Credentials never stored
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* ── Account Cards ── */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-accent-2" />
                Your Accounts
                {isDemo && (
                  <span className="text-xs font-normal text-muted">(sample data)</span>
                )}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {acc.institution}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          acc.type === "checking"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {acc.type === "checking" ? "Checking" : "Savings"}
                      </span>
                    </div>
                    <p className="text-xs text-muted mb-1">
                      {acc.name} ••••{acc.mask}
                    </p>
                    <p className="text-2xl font-black text-foreground">{fmt(acc.balance)}</p>
                  </div>
                ))}

                {/* Total card */}
                <div className="rounded-xl border-2 border-accent-2/30 bg-accent-2/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={14} className="text-accent-2" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-2">
                      Total Available
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-1">All accounts combined</p>
                  <p className="text-2xl font-black text-foreground">{fmt(totalBalance)}</p>
                </div>
              </div>
            </section>

            {/* ── Step 2: Monthly Expenses ── */}
            {!analyzed && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <Calculator size={16} className="text-accent-2" />
                  What are your total monthly expenses?
                </h2>
                <p className="text-sm text-muted mb-5">
                  Include rent, food, utilities, subscriptions, transportation, and any other
                  recurring costs.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold pointer-events-none">
                      $
                    </span>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      placeholder="e.g. 2500"
                      className="pl-8 pr-4 py-3 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent-2 transition-colors text-lg font-semibold w-48"
                      onKeyDown={(e) => e.key === "Enter" && analyze()}
                    />
                  </div>
                  <button
                    onClick={analyze}
                    disabled={!monthlyExpenses || expenses <= 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-2 text-white font-semibold hover:bg-accent-2/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze <ArrowRight size={16} />
                  </button>
                </div>
              </motion.section>
            )}

            {/* ── Step 3: Analysis Results ── */}
            {analyzed && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Surplus / deficit summary */}
                <div
                  className={`rounded-2xl border p-6 ${
                    hasSurplus
                      ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/10"
                      : "border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                        hasSurplus
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {hasSurplus ? (
                        <TrendingUp size={22} className="text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown size={22} className="text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-base font-bold text-foreground">Financial Analysis</h3>
                        <button
                          onClick={resetExpenses}
                          className="text-xs text-muted hover:text-foreground underline"
                        >
                          Edit expenses
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted text-xs mb-0.5">Total Balance</p>
                          <p className="font-bold text-foreground">{fmt(totalBalance)}</p>
                        </div>
                        <div>
                          <p className="text-muted text-xs mb-0.5">Monthly Expenses</p>
                          <p className="font-bold text-foreground">{fmt(expenses)}</p>
                        </div>
                        <div>
                          <p className="text-muted text-xs mb-0.5">
                            Monthly {hasSurplus ? "Surplus" : "Deficit"}
                          </p>
                          <p
                            className={`font-black text-xl ${
                              hasSurplus
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {hasSurplus ? "+" : "-"}
                            {fmt(Math.abs(surplus))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allocations (surplus case) */}
                {hasSurplus && allocations && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-accent-2" />
                      Recommended Monthly Allocations
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <AllocationCard
                        icon={<Shield size={17} />}
                        label="Emergency Fund"
                        amount={allocations.emergency}
                        percent={20}
                        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      />
                      <AllocationCard
                        icon={<Plane size={17} />}
                        label="Vacation Fund"
                        amount={allocations.vacation}
                        percent={10}
                        colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                      />
                      <AllocationCard
                        icon={<TrendingUp size={17} />}
                        label="Investments"
                        amount={allocations.investment}
                        percent={50}
                        colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      />
                      <AllocationCard
                        icon={<PiggyBank size={17} />}
                        label="Misc Savings"
                        amount={allocations.misc}
                        percent={20}
                        colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      />
                    </div>
                  </div>
                )}

                {/* Deficit advice */}
                {!hasSurplus && (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-6">
                    <div className="flex gap-3">
                      <AlertTriangle
                        size={20}
                        className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h3 className="font-bold text-foreground mb-1">
                          Your expenses exceed your balance
                        </h3>
                        <p className="text-sm text-muted mb-3 leading-relaxed">
                          You&apos;re spending {fmt(Math.abs(surplus))} more than you currently have.
                          To start investing, reduce monthly expenses or deposit additional funds.
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          To invest $500/month, you&apos;d need to deposit at least{" "}
                          {fmt(Math.abs(surplus) + 500)} more.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* S&P 500 Picks */}
                <section>
                  <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                    <BarChart3 size={16} className="text-accent-2" />
                    S&P 500 Investment Recommendations
                  </h3>
                  <p className="text-sm text-muted mb-4">
                    {hasSurplus
                      ? `With your ${fmt(investableAmount)}/mo investment budget — click any stock to open the compound interest calculator.`
                      : "Once you have a surplus, consider these top S&P 500 picks. Click to explore projections."}
                  </p>

                  {sp500Loading && (
                    <div className="flex items-center justify-center gap-3 py-10 text-muted">
                      <RefreshCw size={18} className="animate-spin" />
                      <span className="text-sm">Fetching live market data…</span>
                    </div>
                  )}

                  {sp500Error && !sp500Loading && (
                    <div className="flex items-center gap-2 text-sm text-muted py-4">
                      <AlertTriangle size={15} />
                      <span>
                        Could not load market data.{" "}
                        <button onClick={fetchSP500} className="underline hover:text-foreground">
                          Retry
                        </button>
                      </span>
                    </div>
                  )}

                  {!sp500Loading && !sp500Error && sp500.length > 0 && (
                    <div className="space-y-3">
                      {sp500.map((stock) => (
                        <StockRow
                          key={stock.ticker}
                          stock={stock}
                          investableAmount={investableAmount}
                          isExpanded={expandedStock === stock.ticker}
                          onToggle={() =>
                            setExpandedStock(
                              expandedStock === stock.ticker ? null : stock.ticker
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
