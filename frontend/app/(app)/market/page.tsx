"use client";
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_BASE_URL = '';

interface ChartPoint { time: string; price: number; }
interface MarketStats { open: string; high: string; low: string; prevClose: string; vol: string; exchange: string; mktCap: string; peRatio: string; dividend: string; }
interface MarketData { ticker: string; name: string; price: number; change: number; chart: ChartPoint[]; stats: MarketStats; }
interface TrendingItem { sym: string; price: number | string; change: number; }
interface NewsItem { uuid: string; title: string; publisher: string; link: string; providerPublishTime?: number; pubDate?: string; }

// Helper to safely format dates from various API responses
const formatNewsDate = (article: NewsItem) => {
  const ts = article.providerPublishTime || article.pubDate;
  if (!ts) return "Recent";
  // Check if timestamp is in seconds (needs * 1000) or ms, or if it's an ISO string
  const date = new Date(typeof ts === 'number' ? (ts < 1e12 ? ts * 1000 : ts) : ts);
  return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TerminalDashboard() {
  const [ticker, setTicker] = useState<string>('AAPL');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'NVDA', 'BTC-USD', 'TSLA']);

  const currentTickerRef = useRef(ticker);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/market/trending`).then(res => res.json()).then(setTrendingData).catch(console.error);
  }, []);

  useEffect(() => {
    currentTickerRef.current = ticker;
    let isMounted = true;
    
    if (!marketData || marketData.ticker !== ticker) {
      setIsLoading(true);
      setIsNewsLoading(true);
    }
    setError(false);

    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/market/data?ticker=${ticker}&timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Network error');
        const data: MarketData = await response.json();
        if (isMounted) { setMarketData(data); setIsLoading(false); }
      } catch (err) {
        if (isMounted && !marketData) { setError(true); setIsLoading(false); }
      }
    };

    const loadNews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/market/news?ticker=${ticker}`);
        const data = await res.json();
        if (isMounted) { setNews(data); setIsNewsLoading(false); }
      } catch (err) { if (isMounted) setIsNewsLoading(false); }
    };

    loadData();
    loadNews();

    const intervalId = setInterval(() => { if (isMounted) loadData(); }, 5000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [ticker, timeframe]);

  const addToWatchlist = () => { if (marketData && !watchlist.includes(marketData.ticker)) setWatchlist([...watchlist, marketData.ticker]); };
  
  const removeFromWatchlist = (e: React.MouseEvent, symToRemove: string) => {
    e.stopPropagation();
    setWatchlist(watchlist.filter(sym => sym !== symToRemove));
  };

  const isPositive = marketData ? marketData.change >= 0 : true;
  const trendColor = isPositive ? '#10B981' : '#F43F5E'; 
  const trendBg = isPositive ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-rose-500/10 dark:bg-rose-500/20';
  const trendBorder = isPositive ? 'border-emerald-500/20' : 'border-rose-500/20';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans flex flex-col transition-colors duration-500 selection:bg-blue-500/30">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes clock-roll { 0% { transform: translateY(15px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-clock { animation: clock-roll 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      {/* TOP MARQUEE */}
      <div className="w-full bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5 text-[10px] font-mono flex items-center px-4 py-2.5 overflow-hidden whitespace-nowrap shadow-sm">
        <span className="font-bold text-gray-400 dark:text-gray-500 mr-4 uppercase tracking-wider hidden md:inline">⚡ Live Trends:</span>
        <div className="flex gap-8 animate-marquee">
          {trendingData.length > 0 ? trendingData.map(t => (
            <span key={t.sym} className="flex gap-2 items-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setTicker(t.sym)}>
              <span className="font-bold text-gray-800 dark:text-gray-200">{t.sym}</span>
              <span className="text-gray-500 dark:text-gray-400">${t.price}</span>
              <span className={t.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{t.change >= 0 ? '+' : ''}{t.change}%</span>
            </span>
          )) : <span className="text-gray-400 animate-pulse">Syncing market breadth...</span>}
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-8 flex-1 max-w-[1600px] mx-auto w-full">
        
        {/* HEADER & SEARCH */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TopNavigation currentTicker={ticker} onSearch={setTicker} />
          <button 
            onClick={addToWatchlist} disabled={!marketData || watchlist.includes(marketData.ticker)}
            className="w-full md:w-auto flex items-center justify-center gap-2 text-sm font-bold px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {marketData && watchlist.includes(marketData.ticker) ? '✓ Saved' : '+ Add to Watchlist'}
          </button>
        </header>

        {/* WATCHLIST */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 w-full">
          {watchlist.map((sym) => (
            <div 
              key={sym} 
              className={`group flex items-center rounded-xl border text-xs font-bold transition-all shadow-sm flex-shrink-0 hover:-translate-y-0.5
                ${ticker === sym ? 'bg-gray-900 dark:bg-white border-transparent text-white dark:text-gray-900' : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/30'}
              `}
            >
              <button onClick={() => setTicker(sym)} className="px-4 py-2.5">
                {sym}
              </button>
              <button 
                onClick={(e) => removeFromWatchlist(e, sym)}
                className={`px-3 py-2.5 border-l transition-colors ${ticker === sym ? 'border-gray-700 dark:border-gray-200 hover:text-rose-400 dark:hover:text-rose-500' : 'border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 hover:text-rose-500'}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {error ? (
          <div className="flex-1 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl text-rose-600 dark:text-rose-400 p-8 shadow-sm">
            <p className="font-bold text-center text-lg">Data Feed Disconnected for "{ticker}". Verify symbol.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* MAIN CHART PANEL */}
            <div className="col-span-1 lg:col-span-8 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl flex flex-col shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden w-full transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-white/5 gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                  {marketData && (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden flex-shrink-0 p-1">
                      <img 
                        src={`https://assets.parqet.com/logos/symbol/${marketData.ticker}?format=png`} 
                        alt={`${marketData.ticker} logo`} 
                        className="w-full h-full object-contain rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${marketData.ticker}&background=random&color=fff&bold=true`;
                        }} 
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{marketData?.ticker || '...'}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px] sm:max-w-md">{marketData?.name || 'Loading Asset...'}</p>
                  </div>
                </div>
                
                <div className="flex bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl p-1 font-mono text-[10px] sm:text-xs w-full sm:w-auto overflow-x-auto hide-scrollbar shadow-inner">
                  {['1D', '5D', '1M', '6M', '1Y'].map(tf => (
                    <button 
                      key={tf} onClick={() => setTimeframe(tf)}
                      className={`px-4 py-2 rounded-lg transition-all flex-1 sm:flex-none text-center ${timeframe === tf ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[350px] sm:h-[400px] lg:h-[450px] w-full p-4 relative bg-gray-50/30 dark:bg-black/20">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-gray-400 animate-pulse">
                    GENERATING VISUALIZATION...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={marketData?.chart}>
                      <defs>
                        <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={trendColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#888" strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} orientation="right" tick={{fontSize: 11, fill: '#888'}} axisLine={false} tickLine={false} width={45} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 'bold', fontSize: '13px', backdropFilter: 'blur(8px)' }} itemStyle={{ color: trendColor }} />
                      <Area type="monotone" dataKey="price" stroke={trendColor} fillOpacity={1} fill="url(#chartColor)" strokeWidth={3} isAnimationActive={true} animationDuration={800} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* 5. AI LLM SUMMARY PLACEHOLDER */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                  ✨ AI Market Summary
                </div>
                <div className="space-y-2 relative z-10">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {marketData 
                      ? `Based on current signals, ${marketData.ticker} is showing a ${isPositive ? 'positive' : 'negative'} trend over the selected timeframe. The LLM integration will dynamically populate this area with context-aware insights, earnings call summaries, and macroeconomic factors influencing this specific asset.` 
                      : 'Connecting to Intelligence Node...'}
                  </p>
                </div>
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 w-full">
              
              {/* Dynamic Live Price Block */}
              <div className={`bg-white dark:bg-[#141414] border ${trendBorder} rounded-3xl p-8 flex flex-col justify-center items-center text-center relative shadow-xl shadow-gray-200/30 dark:shadow-none transition-colors duration-500 ${trendBg}`}>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Live Market Quote</p>
                <div className="h-[60px] sm:h-[70px] overflow-hidden flex items-center justify-center w-full">
                  {marketData ? (
                    <p key={marketData.price} className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter animate-clock drop-shadow-sm">
                      ${marketData.price.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-5xl sm:text-6xl font-black text-gray-300 dark:text-gray-700">---</p>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm border border-gray-100 dark:border-white/5">
                  <span className="text-sm font-black" style={{ color: trendColor }}>
                    {isPositive ? '▲' : '▼'} {Math.abs(marketData?.change || 0)}%
                  </span>
                </div>
              </div>

              {/* 4. PREDICTION MODEL PLACEHOLDER */}
              <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-gray-200/30 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                  🔮 AI Price Prediction
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">7-Day Forecast</p>
                      <p className="font-bold text-xl text-gray-900 dark:text-white">${marketData ? (marketData.price * (isPositive ? 1.04 : 0.96)).toFixed(2) : '---'}</p>
                    </div>
                    <span className={`font-bold text-sm px-2 py-1 rounded bg-opacity-20 ${isPositive ? 'text-emerald-500 bg-emerald-500' : 'text-rose-500 bg-rose-500'}`}>
                      {isPositive ? 'Bullish' : 'Bearish'}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-bold uppercase">
                      <span>Confidence Score</span>
                      <span>84%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#2a2a2a] rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full w-[84%] relative">
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-gray-200/30 dark:shadow-none">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-100 dark:border-white/5 pb-3">Technical Summary</h3>
                {marketData ? (
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-xs">
                    <StatItem label="Open" value={marketData.stats.open} />
                    <StatItem label="High" value={marketData.stats.high} />
                    <StatItem label="Low" value={marketData.stats.low} />
                    <StatItem label="Prev Close" value={marketData.stats.prevClose} />
                    <StatItem label="Volume" value={marketData.stats.vol} />
                    <StatItem label="Mkt Cap" value={marketData.stats.mktCap} />
                    <StatItem label="P/E Ratio" value={marketData.stats.peRatio} />
                    <StatItem label="Div Yield" value={marketData.stats.dividend} />
                  </div>
                ) : (
                  <div className="animate-pulse flex flex-col gap-5 mt-2">
                    <div className="h-10 bg-gray-100 dark:bg-[#2a2a2a] rounded-xl w-full"></div>
                    <div className="h-10 bg-gray-100 dark:bg-[#2a2a2a] rounded-xl w-full"></div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* BOTTOM SECTION: NEWS & IPOS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 mb-12 w-full">
          
          {/* NEWS HEADLINES */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h3 className="text-xl font-black mb-5 flex items-center gap-3">
              <span className="w-2 h-6 rounded-full" style={{ backgroundColor: trendColor }}></span>
              Intelligence Feed
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isNewsLoading ? (
                <p className="text-sm text-gray-400 font-mono italic p-6 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/10 col-span-1 md:col-span-2">Scanning global publications...</p>
              ) : news.length > 0 ? (
                news.map((article, idx) => (
                  <a 
                    key={article.uuid || idx} href={article.link || '#'} target="_blank" rel="noreferrer"
                    className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        {article.publisher || 'Market News'}
                      </p>
                      <h4 className="text-[15px] font-bold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                        {article.title}
                      </h4>
                    </div>
                    {/* Fixed Date Logic applied here */}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-5 font-medium flex items-center gap-1.5">
                       {formatNewsDate(article)}
                    </p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic p-6 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/10 col-span-1 md:col-span-2">
                  No specific headlines detected for {ticker} at this moment.
                </p>
              )}
            </div>
          </div>

          {/* UPCOMING IPOS */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <h3 className="text-xl font-black mb-5 flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Upcoming IPOs
            </h3>
            
            <div className="bg-white dark:bg-[#141414] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm p-3 flex flex-col gap-1">
              <IpoRow company="Stripe" sector="Fintech" date="Q3 2026" est="$65B" />
              <IpoRow company="Databricks" sector="Enterprise AI" date="Q4 2026" est="$43B" />
              <IpoRow company="Chime" sector="Digital Banking" date="2026" est="$25B" />
              <IpoRow company="Discord" sector="Social Media" date="TBD" est="$15B" />
              <IpoRow company="Epic Games" sector="Gaming / Tech" date="TBD" est="$22B" />
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/5">
      <span className="text-gray-400 dark:text-gray-500 mb-1 text-[10px] uppercase font-bold tracking-wider">{label}</span>
      <span className="font-mono font-bold text-gray-900 dark:text-gray-200">{value}</span>
    </div>
  );
}

function IpoRow({ company, sector, date, est }: { company: string, sector: string, date: string, est: string }) {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-2xl transition-all flex flex-wrap sm:flex-nowrap items-center justify-between cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
          {company.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-sm">{company}</h4>
          <p className="text-[10px] text-gray-500 uppercase font-medium">{sector}</p>
        </div>
      </div>
      <div className="text-right mt-2 sm:mt-0">
        <p className="font-mono text-xs font-bold">{est}</p>
        <p className="text-[10px] text-gray-400 font-medium">{date}</p>
      </div>
    </div>
  );
}

function TopNavigation({ currentTicker, onSearch }: { currentTicker: string; onSearch: (ticker: string) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/market/search?q=${query}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSuggestions(data);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (sym: string) => {
    onSearch(sym.toUpperCase()); setQuery(''); setSuggestions([]); setIsFocused(false);
  };

  return (
    <div className="relative w-full md:w-[450px] z-50">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input 
          value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white pl-12 pr-12 py-3.5 font-mono text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 uppercase transition-all shadow-sm placeholder:text-gray-400 placeholder:normal-case"
          placeholder="Search Symbol (e.g. MSFT)..."
          onKeyDown={(e) => { if (e.key === 'Enter' && query.trim() !== '') handleSelect(query); }}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-[#2a2a2a] px-2 py-1 rounded text-gray-400 text-[10px] font-mono font-bold">↵</div>
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
          {suggestions.map((s, idx) => (
            <div key={idx} onClick={() => handleSelect(s.symbol)} className="px-5 py-3.5 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors">
              <div>
                <span className="font-bold block">{s.symbol}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] block">{s.shortname || s.longname}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 dark:bg-black rounded-lg text-gray-500">{s.quoteType}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}