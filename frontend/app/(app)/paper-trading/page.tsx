"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
}

interface Transaction {
  id: string;
  type: "buy" | "sell";
  ticker: string;
  name: string;
  shares: number;
  price: number;
  total: number;
  date: string;
}

interface Portfolio {
  cash: number;
  holdings: Holding[];
  transactions: Transaction[];
}

interface LivePrice {
  ticker: string;
  price: number;
  change: number;
  name: string;
}

interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_CASH = 10_000;
const LS_KEY = "paper_portfolio";
const DEFAULT_PORTFOLIO: Portfolio = { cash: INITIAL_CASH, holdings: [], transactions: [] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtPct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaperTradingPage() {
  const [portfolio, setPortfolio] = useState<Portfolio>(DEFAULT_PORTFOLIO);
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  // Trade form state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState<LivePrice | null>(null);
  const [shares, setShares] = useState("");
  const [tradeLoading, setTradeLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tradeError, setTradeError] = useState("");
  const [tradeSuccess, setTradeSuccess] = useState("");

  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  // ── Persistence ─────────────────────────────────────────────────────────────

  // Load saved portfolio on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setPortfolio(JSON.parse(saved));
    } catch {}
    hydrated.current = true;
  }, []);

  // Save on every change, but skip the initial render (before load completes)
  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(LS_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  // ── Live prices ─────────────────────────────────────────────────────────────

  const fetchLivePrices = useCallback(async (holdings: Holding[]) => {
    if (holdings.length === 0) return;
    setPricesLoading(true);
    try {
      const results = await Promise.all(
        holdings.map(async (h) => {
          const res = await fetch(`/api/market/data?ticker=${h.ticker}`);
          const data = await res.json();
          return {
            ticker: h.ticker,
            price: data.price ?? 0,
            change: data.change ?? 0,
            name: data.name ?? h.name,
          };
        })
      );
      const map: Record<string, LivePrice> = {};
      results.forEach((r) => { map[r.ticker] = r; });
      setLivePrices(map);
    } catch {}
    setPricesLoading(false);
  }, []);

  useEffect(() => {
    fetchLivePrices(portfolio.holdings);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stock search (debounced) ─────────────────────────────────────────────────

  useEffect(() => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        const data: SearchResult[] = await res.json();
        setSuggestions(data.slice(0, 6));
        setShowSuggestions(true);
      } catch {}
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Select stock ─────────────────────────────────────────────────────────────

  const selectStock = async (symbol: string, name: string) => {
    setQuery(symbol);
    setShowSuggestions(false);
    setSelectedStock(null);
    setTradeError("");
    setTradeLoading(true);
    try {
      const res = await fetch(`/api/market/data?ticker=${symbol}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSelectedStock({
        ticker: symbol,
        price: data.price ?? 0,
        change: data.change ?? 0,
        name: data.name ?? name,
      });
    } catch {
      setTradeError("Could not fetch price for this stock.");
    }
    setTradeLoading(false);
  };

  // ── Execute trade ────────────────────────────────────────────────────────────

  const executeTrade = (type: "buy" | "sell") => {
    if (!selectedStock || !shares) return;
    const qty = parseFloat(shares);
    if (isNaN(qty) || qty <= 0) {
      setTradeError("Enter a valid number of shares.");
      return;
    }
    const total = qty * selectedStock.price;

    if (type === "buy" && total > portfolio.cash) {
      setTradeError(
        `Not enough cash. Need ${fmt(total)}, have ${fmt(portfolio.cash)}.`
      );
      return;
    }
    if (type === "sell") {
      const existing = portfolio.holdings.find((h) => h.ticker === selectedStock.ticker);
      if (!existing || existing.shares < qty) {
        setTradeError(
          `You only hold ${existing?.shares ?? 0} share(s) of ${selectedStock.ticker}.`
        );
        return;
      }
    }

    const tx: Transaction = {
      id: Date.now().toString(),
      type,
      ticker: selectedStock.ticker,
      name: selectedStock.name,
      shares: qty,
      price: selectedStock.price,
      total,
      date: new Date().toISOString(),
    };

    setPortfolio((prev) => {
      let newHoldings = [...prev.holdings];
      if (type === "buy") {
        const idx = newHoldings.findIndex((h) => h.ticker === selectedStock.ticker);
        if (idx >= 0) {
          const ex = newHoldings[idx];
          const totalShares = ex.shares + qty;
          const newAvg = (ex.avgPrice * ex.shares + selectedStock.price * qty) / totalShares;
          newHoldings[idx] = { ...ex, shares: totalShares, avgPrice: newAvg };
        } else {
          newHoldings.push({
            ticker: selectedStock.ticker,
            name: selectedStock.name,
            shares: qty,
            avgPrice: selectedStock.price,
          });
        }
        return { ...prev, cash: prev.cash - total, holdings: newHoldings, transactions: [tx, ...prev.transactions] };
      } else {
        const idx = newHoldings.findIndex((h) => h.ticker === selectedStock.ticker);
        if (idx >= 0) {
          const remaining = newHoldings[idx].shares - qty;
          if (remaining <= 0.0001) {
            newHoldings.splice(idx, 1);
          } else {
            newHoldings[idx] = { ...newHoldings[idx], shares: remaining };
          }
        }
        return { ...prev, cash: prev.cash + total, holdings: newHoldings, transactions: [tx, ...prev.transactions] };
      }
    });

    setTradeError("");
    setTradeSuccess(
      `${type === "buy" ? "Bought" : "Sold"} ${qty} share(s) of ${selectedStock.ticker} at ${fmt(selectedStock.price)}.`
    );
    setShares("");
    setTimeout(() => setTradeSuccess(""), 4000);
  };

  // ── Derived portfolio stats ──────────────────────────────────────────────────

  const investedValue = portfolio.holdings.reduce((sum, h) => {
    const price = livePrices[h.ticker]?.price ?? h.avgPrice;
    return sum + h.shares * price;
  }, 0);
  const totalValue = portfolio.cash + investedValue;
  const totalGain = totalValue - INITIAL_CASH;
  const totalGainPct = (totalGain / INITIAL_CASH) * 100;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Paper Trading</h1>
          <p className="mt-1 text-muted text-sm">
            Practice with ${INITIAL_CASH.toLocaleString()} virtual cash — no real money at risk
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs text-muted hover:text-foreground hover:bg-input-bg transition-colors flex-shrink-0 ml-4"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted mb-1">Total Value</p>
          <p className="text-xl font-black text-foreground">{fmt(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted mb-1">Cash Available</p>
          <p className="text-xl font-black text-foreground">{fmt(portfolio.cash)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted mb-1">Invested</p>
          <p className="text-xl font-black text-foreground">{fmt(investedValue)}</p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            totalGain >= 0
              ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/10"
              : "border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10"
          }`}
        >
          <p className="text-xs text-muted mb-1">Total P&amp;L</p>
          <p
            className={`text-xl font-black ${
              totalGain >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {totalGain >= 0 ? "+" : ""}
            {fmt(totalGain)}
          </p>
          <p
            className={`text-xs font-semibold mt-0.5 ${
              totalGain >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {fmtPct(totalGainPct)}
          </p>
        </div>
      </div>

      {/* Trade form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Activity size={16} className="text-accent-2" /> Place a Trade
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedStock(null);
                  setTradeError("");
                  setTradeSuccess("");
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search ticker or company…"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted text-sm focus:outline-none focus:border-accent-2 transition-colors"
              />
              {(searchLoading || tradeLoading) ? (
                <RefreshCw
                  size={13}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted animate-spin"
                />
              ) : query ? (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedStock(null);
                    setSuggestions([]);
                    setTradeError("");
                    setTradeSuccess("");
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 top-full mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() =>
                        selectStock(s.symbol, s.shortname ?? s.longname ?? s.symbol)
                      }
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-input-bg transition-colors border-b border-border last:border-0"
                    >
                      <span className="font-black text-xs text-accent-2 w-14 flex-shrink-0">
                        {s.symbol}
                      </span>
                      <span className="text-sm text-foreground truncate">
                        {s.shortname ?? s.longname ?? ""}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shares input */}
          <input
            type="number"
            value={shares}
            onChange={(e) => {
              setShares(e.target.value);
              setTradeError("");
            }}
            placeholder="Shares"
            min="0"
            step="any"
            className="w-28 px-3 py-2.5 rounded-xl border border-border bg-input-bg text-foreground placeholder:text-muted text-sm focus:outline-none focus:border-accent-2 transition-colors"
          />

          {/* Buy / Sell buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => executeTrade("buy")}
              disabled={!selectedStock || !shares || tradeLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent-2 text-white font-bold text-sm hover:bg-accent-2/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={15} /> Buy
            </button>
            <button
              onClick={() => executeTrade("sell")}
              disabled={!selectedStock || !shares || tradeLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-red-400 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={15} /> Sell
            </button>
          </div>
        </div>

        {/* Selected stock preview */}
        <AnimatePresence>
          {selectedStock && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center flex-wrap gap-x-4 gap-y-1 px-4 py-3 rounded-xl bg-input-bg border border-border text-sm"
            >
              <div>
                <span className="font-black text-foreground">{selectedStock.ticker}</span>
                <span className="text-muted ml-2 text-xs">{selectedStock.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="font-bold text-foreground">{fmt(selectedStock.price)}</span>
                <span
                  className={`text-xs font-semibold ${
                    selectedStock.change >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {fmtPct(selectedStock.change)}
                </span>
              </div>
              {shares && parseFloat(shares) > 0 && (
                <div className="text-xs text-muted border-l border-border pl-3">
                  Est. total:{" "}
                  <span className="font-bold text-foreground">
                    {fmt(parseFloat(shares) * selectedStock.price)}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / success messages */}
        <AnimatePresence>
          {tradeError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
            >
              <AlertTriangle size={14} /> {tradeError}
            </motion.p>
          )}
          {tradeSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400"
            >
              ✓ {tradeSuccess}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Holdings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Wallet size={16} className="text-accent-2" /> Holdings
            {portfolio.holdings.length > 0 && (
              <span className="text-xs font-normal text-muted">
                ({portfolio.holdings.length} position{portfolio.holdings.length !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
          {portfolio.holdings.length > 0 && (
            <button
              onClick={() => fetchLivePrices(portfolio.holdings)}
              disabled={pricesLoading}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RefreshCw size={12} className={pricesLoading ? "animate-spin" : ""} />
              Refresh prices
            </button>
          )}
        </div>

        {portfolio.holdings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted text-sm">
              No positions yet — search for a stock above and place your first trade.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-2 px-5 py-3 border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
              <span className="col-span-2">Stock</span>
              <span className="text-right">Shares</span>
              <span className="text-right">Avg / Current</span>
              <span className="text-right">P&amp;L</span>
            </div>

            {portfolio.holdings.map((h) => {
              const live = livePrices[h.ticker];
              const currentPrice = live?.price ?? h.avgPrice;
              const value = h.shares * currentPrice;
              const cost = h.shares * h.avgPrice;
              const pl = value - cost;
              const plPct = cost > 0 ? (pl / cost) * 100 : 0;
              const isUp = pl >= 0;

              return (
                <div
                  key={h.ticker}
                  className="grid grid-cols-5 gap-2 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-input-bg/50 transition-colors"
                >
                  <div className="col-span-2">
                    <p className="font-black text-sm text-foreground">{h.ticker}</p>
                    <p className="text-xs text-muted truncate">{h.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-foreground">
                      {h.shares % 1 === 0 ? h.shares : h.shares.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted">{fmt(value)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">{fmt(h.avgPrice)}</p>
                    <p className="font-semibold text-sm text-foreground">{fmt(currentPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-black text-sm ${
                        isUp
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {fmt(pl)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        isUp
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {fmtPct(plPct)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Transaction history */}
      {portfolio.transactions.length > 0 && (
        <section>
          <button
            onClick={() => setShowHistory((p) => !p)}
            className="flex items-center gap-2 text-base font-bold text-foreground mb-3 hover:text-accent-2 transition-colors"
          >
            {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Transaction History
            <span className="text-xs font-normal text-muted">
              ({portfolio.transactions.length})
            </span>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="grid grid-cols-4 gap-2 px-5 py-3 border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
                    <span className="col-span-2">Trade</span>
                    <span className="text-right">Shares × Price</span>
                    <span className="text-right">Total</span>
                  </div>
                  {portfolio.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="grid grid-cols-4 gap-2 items-center px-5 py-3.5 border-b border-border last:border-0 text-sm"
                    >
                      <div className="col-span-2 flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                            tx.type === "buy"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-red-100 dark:bg-red-900/30"
                          }`}
                        >
                          {tx.type === "buy" ? (
                            <ArrowUpRight
                              size={13}
                              className="text-green-600 dark:text-green-400"
                            />
                          ) : (
                            <ArrowDownRight
                              size={13}
                              className="text-red-600 dark:text-red-400"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {tx.ticker}{" "}
                            <span
                              className={`text-xs ${
                                tx.type === "buy"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {tx.type.toUpperCase()}
                            </span>
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(tx.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-muted text-xs">
                        {tx.shares % 1 === 0 ? tx.shares : tx.shares.toFixed(4)} ×{" "}
                        {fmt(tx.price)}
                      </div>
                      <div
                        className={`text-right font-bold ${
                          tx.type === "buy"
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {tx.type === "buy" ? "-" : "+"}
                        {fmt(tx.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* Reset confirm modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <h3 className="font-bold text-foreground mb-2">Reset Portfolio?</h3>
              <p className="text-sm text-muted mb-5 leading-relaxed">
                This will clear all positions and trade history, and restore your{" "}
                {fmt(INITIAL_CASH)} starting balance.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPortfolio(DEFAULT_PORTFOLIO);
                    setLivePrices({});
                    setSelectedStock(null);
                    setQuery("");
                    setShares("");
                    setTradeError("");
                    setTradeSuccess("");
                    setShowResetModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-input-bg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
