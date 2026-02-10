"use client";

import React, { useState, useEffect } from 'react';
import { 
  Divide, PieChart, Activity, TrendingUp, Layers, Anchor, 
  Brain, Calculator, CheckCircle, Circle, ChevronRight, 
  RotateCcw, Award, BookOpen 
} from "lucide-react";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// ==========================================
// TYPES
// ==========================================

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  content: React.ReactNode; 
};

export type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  lessons: Lesson[];
  quiz: QuizQuestion[];
};

// ==========================================
// DATA CONTENT & CURRICULUM
// ==========================================

export const LEARNING_MODULES: Module[] = [
  // ------------------------------------------------------------------
  // MODULE 1: THE ECONOMIC ENGINE
  // ------------------------------------------------------------------
  {
    id: "m1",
    title: "Module 1: The Economic Engine",
    description: "Understand the invisible forces of inflation, interest, and risk.",
    icon: <Divide className="w-5 h-5" />,
    lessons: [
      {
        id: "l1-1",
        title: "Inflation & Purchasing Power",
        duration: "15 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">The Silent Thief</h3>
            <p className="leading-relaxed text-lg text-muted">
              Inflation is not just "prices going up." It is the rate at which the purchasing power of a currency falls. 
              If you bury $10,000 in your backyard today, in 20 years it will still be $10,000, but it might only buy what $5,000 buys today.
            </p>

            <div className="my-6 border border-border rounded-xl overflow-hidden">
               
            </div>

            <div className="p-6 bg-input-bg border border-border rounded-xl">
              <h4 className="font-bold text-xl mb-2 text-foreground">The Real Return Formula</h4>
              <p className="text-sm text-muted mb-4">
                To know if you are actually building wealth, you must look at "Real Returns," not "Nominal Returns."
              </p>
              
              <div className="text-lg overflow-x-auto py-2">
                <BlockMath math="\text{Real Return} \approx \text{Nominal Return} - \text{Inflation Rate}" />
              </div>
              
              <div className="mt-4 text-sm bg-card p-4 rounded border border-border shadow-sm">
                <strong>Example:</strong> If your savings account pays <span className="text-accent-2 font-bold">5%</span> interest, 
                but inflation is <span className="text-red-500 font-bold">3%</span>, your <em>real</em> wealth is only growing by <span className="text-accent font-bold">2%</span>.
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "l1-2",
        title: "The Time Value of Money",
        duration: "20 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">Compound Interest</h3>
            <p className="leading-relaxed text-lg text-muted">
              Compound interest is the concept of earning "interest on your interest." It creates an exponential growth curve.
              The most critical variable in compounding is not the amount of money, but <strong>Time (t)</strong>.
            </p>
            
            <div className="my-6 border border-border rounded-xl overflow-hidden">
                
            </div>
            
            <div className="p-6 bg-accent/10 border border-accent/20 rounded-xl">
               <h4 className="font-bold text-accent mb-2">The Formula</h4>
               <div className="py-2 overflow-x-auto">
                 <BlockMath math="A = P \left(1 + \frac{r}{n}\right)^{nt}" />
               </div>
               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
                 <li className="bg-card p-3 rounded border border-border"><InlineMath math="P" /> = Principal (Starting Amount)</li>
                 <li className="bg-card p-3 rounded border border-border"><InlineMath math="r" /> = Annual Interest Rate (decimal)</li>
                 <li className="bg-card p-3 rounded border border-border"><InlineMath math="n" /> = Times compounded per year</li>
                 <li className="bg-card p-3 rounded border border-border font-bold"><InlineMath math="t" /> = Time in Years</li>
               </ul>
            </div>
          </div>
        ),
      },
      {
        id: "l1-3",
        title: "Risk vs. Reward",
        duration: "15 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">The Iron Law of Finance</h3>
            <p className="leading-relaxed text-lg text-muted">
              There is no "safe high return." To achieve higher returns, you must accept higher volatility (risk). 
              The baseline is the "Risk-Free Rate," usually defined by US Treasury Bonds.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
               <div className="p-5 bg-accent-2/10 rounded-xl border border-accent-2/20">
                 <h5 className="font-bold text-accent-2 text-lg">Low Risk</h5>
                 <p className="text-sm text-muted mt-1">Cash, CDs, Gov Bonds.</p>
                 <p className="text-xs font-mono mt-3 opacity-60">Exp Return: 3-5%</p>
               </div>
               <div className="p-5 bg-accent/10 rounded-xl border border-accent/20">
                 <h5 className="font-bold text-accent text-lg">Medium Risk</h5>
                 <p className="text-sm text-muted mt-1">S&P 500, Real Estate, Corp Bonds.</p>
                 <p className="text-xs font-mono mt-3 opacity-60">Exp Return: 7-10%</p>
               </div>
               <div className="p-5 bg-red-500/10 rounded-xl border border-red-500/20">
                 <h5 className="font-bold text-red-500 text-lg">High Risk</h5>
                 <p className="text-sm text-muted mt-1">Startups, Crypto, Options.</p>
                 <p className="text-xs font-mono mt-3 opacity-60">Exp Return: -100% to +1000%</p>
               </div>
            </div>
          </div>
        )
      }
    ],
    quiz: [
      {
        id: "q1-1",
        question: "If inflation is 4% and your investment returns 6%, what is your approximate Real Return?",
        options: ["10%", "2%", "6%", "-2%"],
        correctIndex: 1,
        explanation: "Real Return ≈ Nominal Return (6%) - Inflation (4%) = 2%."
      },
      {
        id: "q1-2",
        question: "Which variable has the most powerful effect in the compound interest formula over the long term?",
        options: ["Principal (P)", "Frequency (n)", "Time (t)", "None of the above"],
        correctIndex: 2,
        explanation: "Time is an exponent in the formula, meaning it drives exponential growth more than linear additions to principal."
      },
      {
        id: "q1-3",
        question: "What is typically considered the 'Risk-Free Rate' benchmark?",
        options: ["The S&P 500 average", "US Treasury Bonds", "Gold prices", "Apple Stock"],
        correctIndex: 1,
        explanation: "US Treasury Bonds are backed by the full faith and credit of the US government, making them the standard for 'risk-free' returns."
      },
      {
        id: "q1-4",
        question: "What happens to purchasing power during high inflation?",
        options: ["It increases", "It stays the same", "It decreases", "It fluctuates wildly"],
        correctIndex: 2,
        explanation: "As prices rise (inflation), each unit of currency buys fewer goods and services."
      },
      {
        id: "q1-5",
        question: "To get higher potential returns, you generally must accept:",
        options: ["Lower taxes", "Higher volatility/risk", "Lower liquidity", "Higher fees"],
        correctIndex: 1,
        explanation: "The risk/reward tradeoff is fundamental. Higher expected returns act as compensation for enduring higher volatility."
      }
    ]
  },

  // ------------------------------------------------------------------
  // MODULE 2: ASSET CLASSES
  // ------------------------------------------------------------------
  {
    id: "m2",
    title: "Module 2: Investment Vehicles",
    description: "Deep dive into Stocks, Bonds, ETFs, and how to value them.",
    icon: <PieChart className="w-5 h-5" />,
    lessons: [
      {
        id: "l2-1",
        title: "Equities (Stocks)",
        duration: "20 min",
        content: (
          <div className="space-y-5 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">Equity = Ownership</h3>
            <p className="text-lg text-muted">
              When you buy a stock, you are not just buying a ticker symbol. You are buying a legal claim to a fraction of a company's future cash flows.
            </p>
            <div className="p-5 bg-card border border-border rounded-xl mt-4">
              <h4 className="font-bold text-lg mb-2">Market Capitalization</h4>
              <p className="text-sm text-muted mb-3">This tells you how much the "market" thinks the whole company is worth.</p>
              <BlockMath math="\text{Market Cap} = \text{Share Price} \times \text{Shares Outstanding}" />
            </div>
          </div>
        ),
      },
      {
        id: "l2-2",
        title: "Valuation Metrics",
        duration: "25 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">Price vs. Value</h3>
            <p className="text-lg text-muted">
              A $1000 stock can be "cheap" and a $5 stock can be "expensive." Valuation depends on earnings.
            </p>
            
            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
               <h4 className="font-bold text-purple-500 mb-2">The P/E Ratio</h4>
               <BlockMath math="\text{P/E} = \frac{\text{Share Price}}{\text{Earnings Per Share}}" />
               <p className="text-sm mt-4 text-muted">
                 <strong>High P/E:</strong> Investors expect high growth (e.g., Tech).<br/>
                 <strong>Low P/E:</strong> Mature company or undervalued (e.g., Utilities).
               </p>
            </div>
          </div>
        )
      },
      {
        id: "l2-3",
        title: "Fixed Income (Bonds)",
        duration: "15 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
             <h3 className="text-3xl font-bold tracking-tight">The Seesaw Effect</h3>
             <p className="text-lg text-muted">
               Bonds pay a fixed "coupon." When new interest rates in the market rise, existing bonds with lower coupons become less valuable.
             </p>
             <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl">
               <div className="flex items-center gap-3 mb-4">
                 <Anchor className="w-6 h-6 text-orange-600"/>
                 <h4 className="font-bold text-orange-600 text-xl">The Rule</h4>
               </div>
               <p className="text-xl font-bold text-center">
                 Rates UP <TrendingUp className="inline w-4 h-4 text-green-500"/> = Prices DOWN <TrendingUp className="inline w-4 h-4 text-red-500 rotate-180"/>
               </p>
               <div className="mt-4 bg-card p-4 rounded text-center border border-border">
                  <BlockMath math="\text{Yield} = \frac{\text{Coupon Payment}}{\text{Current Price}}" />
               </div>
             </div>
          </div>
        )
      },
      {
        id: "l2-4",
        title: "Funds (ETFs vs Mutual Funds)",
        duration: "15 min",
        content: (
          <div className="space-y-5 font-sans text-foreground">
             <h3 className="text-3xl font-bold tracking-tight">Diversification</h3>
             <p className="text-lg text-muted">
               Funds allow you to buy the "haystack" instead of looking for the needle.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                 <h4 className="font-bold text-xl mb-4 text-accent">ETF</h4>
                 <ul className="space-y-3 list-disc pl-4 text-muted">
                   <li>Trades all day (Real-time pricing)</li>
                   <li>Usually Passive (Index tracking)</li>
                   <li>Tax Efficient</li>
                   <li>Low Expense Ratios</li>
                 </ul>
               </div>
               <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
                 <h4 className="font-bold text-xl mb-4 text-accent-2">Mutual Fund</h4>
                 <ul className="space-y-3 list-disc pl-4 text-muted">
                   <li>Trades once (at market close)</li>
                   <li>Often Active (Manager picking stocks)</li>
                   <li>Capital Gains distributions</li>
                   <li>Often Higher Fees</li>
                 </ul>
               </div>
             </div>
          </div>
        )
      }
    ],
    quiz: [
      {
        id: "q2-1",
        question: "What does ownership of a 'Share' represent?",
        options: ["A loan to the company", "Fractional ownership of the company", "A guaranteed dividend", "Right to manage the company daily"],
        correctIndex: 1,
        explanation: "Equity is ownership. You own a piece of the company's assets and earnings."
      },
      {
        id: "q2-2",
        question: "If interest rates RISE, what generally happens to the price of existing bonds?",
        options: ["Prices Rise", "Prices Fall", "Prices stay the same", "Coupons double"],
        correctIndex: 1,
        explanation: "Because new bonds offer higher yields, existing bonds with lower coupons become less attractive, forcing their price down to match the new yield."
      },
      {
        id: "q2-3",
        question: "Which ratio helps determine if a stock is 'expensive' relative to its earnings?",
        options: ["Price-to-Earnings (P/E)", "Debt-to-Equity", "Return on Assets", "Sharpe Ratio"],
        correctIndex: 0,
        explanation: "The P/E ratio compares the stock price to the actual profits (earnings) the company generates."
      },
      {
        id: "q2-4",
        question: "Which vehicle typically trades intra-day like a stock?",
        options: ["Mutual Fund", "ETF (Exchange Traded Fund)", "Certificate of Deposit", "Savings Bond"],
        correctIndex: 1,
        explanation: "ETFs trade on exchanges throughout the day, whereas Mutual Funds only price once at the end of the trading day."
      },
      {
        id: "q2-5",
        question: "Market Capitalization is calculated by:",
        options: ["Assets minus Liabilities", "Share Price × Total Shares Outstanding", "Revenue × 10", "Net Income + Cash"],
        correctIndex: 1,
        explanation: "Market Cap is the total aggregate value of all shares combined."
      }
    ]
  },

  // ------------------------------------------------------------------
  // MODULE 3: MARKET MECHANICS
  // ------------------------------------------------------------------
  {
    id: "m3",
    title: "Module 3: Market Mechanics",
    description: "How the market actually functions: Order books, Technicals, and Cycles.",
    icon: <Activity className="w-5 h-5" />,
    lessons: [
      { 
        id: "l3-1", 
        title: "The Order Book", 
        duration: "20 min", 
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">The Auction</h3>
            <p className="text-lg text-muted">
              There is no "store" setting prices. Prices are discovered via a continuous double-auction.
            </p>
            <div className="p-6 bg-card rounded-xl border border-border">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <p className="text-sm font-bold uppercase text-accent-2 mb-1">The Bid</p>
                  <p className="text-muted">Highest price a buyer pays.</p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-red-500 mb-1">The Ask</p>
                  <p className="text-muted">Lowest price a seller accepts.</p>
                </div>
              </div>
              <div className="mt-6 border-t border-border pt-4 text-center">
                <BlockMath math="\text{Spread} = \text{Ask} - \text{Bid}" />
                <p className="text-xs text-muted mt-2">Low liquidity = High Spread (Costly to trade).</p>
              </div>
            </div>
          </div>
        ) 
      },
      {
        id: "l3-2",
        title: "Intro to Technical Analysis",
        duration: "25 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">Reading Price Action</h3>
            <p className="text-lg text-muted">
              Technical Analysis (TA) ignores the company's business and focuses purely on price history and volume.
            </p>
            
            <div className="my-6 border border-border rounded-xl overflow-hidden">
               
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-accent-2/10 p-4 rounded-lg border border-accent-2/20">
                <h4 className="font-bold text-accent-2 mb-1">Bullish Candle (Green)</h4>
                <p className="text-sm text-muted">Close Price &gt; Open Price.</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <h4 className="font-bold text-red-500 mb-1">Bearish Candle (Red)</h4>
                <p className="text-sm text-muted">Close Price &lt; Open Price.</p>
              </div>
            </div>
          </div>
        )
      },
      { 
        id: "l3-3", 
        title: "Market Cycles", 
        duration: "15 min", 
        content: (
          <div className="space-y-5 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">Bulls & Bears</h3>
            <p className="text-lg text-muted">Markets move in psychological cycles of expansion and contraction.</p>
            <div className="space-y-4 mt-4">
              <div className="flex items-start gap-4 p-4 bg-accent-2/5 border-l-4 border-accent-2 rounded-r-lg">
                <div>
                  <h4 className="font-bold text-accent-2">Bull Market</h4>
                  <p className="text-sm text-muted">Usually defined as a 20% rise from lows. Driven by optimism.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-red-500/5 border-l-4 border-red-500 rounded-r-lg">
                <div>
                  <h4 className="font-bold text-red-500">Bear Market</h4>
                  <p className="text-sm text-muted">Usually defined as a 20% drop from highs. Driven by fear/recession.</p>
                </div>
              </div>
            </div>
          </div>
        ) 
      },
    ],
    quiz: [
      {
        id: "q3-1",
        question: "What is the 'Spread' in an order book?",
        options: ["The broker's commission", "The difference between the Bid and Ask price", "The daily range of a stock", "The dividend yield"],
        correctIndex: 1,
        explanation: "The spread represents the gap between what buyers are willing to pay and sellers are willing to accept. It is a cost of trading."
      },
      {
        id: "q3-2",
        question: "In a Candlestick chart, what does a GREEN candle usually indicate?",
        options: ["The stock closed lower than it opened", "The stock closed higher than it opened", "High volatility", "Low volume"],
        correctIndex: 1,
        explanation: "A green (or white) candle indicates bullish price action where the close price was higher than the opening price."
      },
      {
        id: "q3-3",
        question: "A 'Bear Market' is typically defined as a drop of what percentage from recent highs?",
        options: ["5%", "10%", "20%", "50%"],
        correctIndex: 2,
        explanation: "While 10% is a 'correction', a 20% drop is the technical definition of a Bear Market."
      },
      {
        id: "q3-4",
        question: "Which price represents what a Seller is willing to accept?",
        options: ["The Bid", "The Ask", "The Strike", "The Spot"],
        correctIndex: 1,
        explanation: "The Ask is the lowest price a seller is currently offering in the order book."
      },
      {
        id: "q3-5",
        question: "Technical Analysis focuses primarily on:",
        options: ["Company earnings reports", "Management team quality", "Price action and Volume history", "Industry supply chains"],
        correctIndex: 2,
        explanation: "TA is the study of market action (price/volume) rather than the fundamental business data."
      }
    ]
  },

  // ------------------------------------------------------------------
  // MODULE 4: STRATEGY
  // ------------------------------------------------------------------
  {
    id: "m4",
    title: "Module 4: Portfolio Strategy",
    description: "Building your fortress: Allocation, DCA, and Rebalancing.",
    icon: <Layers className="w-5 h-5" />,
    lessons: [
       {
         id: "l4-1",
         title: "Asset Allocation",
         duration: "20 min",
         content: (
           <div className="space-y-6 font-sans text-foreground">
             <h3 className="text-3xl font-bold tracking-tight">The Secret Sauce</h3>
             <p className="text-lg text-muted">
               90% of your portfolio's variance is explained by Asset Allocation (how much Stocks vs Bonds), not by which specific stocks you pick.
             </p>
             
             <div className="my-6 border border-border rounded-xl overflow-hidden">
                
             </div>

             <div className="p-6 bg-card border border-border rounded-xl">
               <h4 className="font-bold mb-3 text-foreground">The Classic 60/40</h4>
               <div className="h-6 w-full flex rounded-full overflow-hidden">
                  <div className="w-[60%] bg-accent flex items-center justify-center text-xs text-white font-bold">60% Stocks</div>
                  <div className="w-[40%] bg-orange-400 flex items-center justify-center text-xs text-white font-bold">40% Bonds</div>
               </div>
               <p className="text-sm mt-3 text-muted">
                 Stocks provide growth (engine), Bonds provide stability (shock absorbers).
               </p>
             </div>
           </div>
         )
       },
       {
         id: "l4-2",
         title: "Dollar Cost Averaging (DCA)",
         duration: "10 min",
         content: (
           <div className="space-y-5 font-sans text-foreground">
             <h3 className="text-3xl font-bold tracking-tight">Beat the Timing</h3>
             <p className="text-lg text-muted">
               Timing the bottom is mathematically impossible for most. DCA removes emotion by investing a fixed amount on a fixed schedule.
             </p>
             <div className="p-6 bg-accent-2/10 border border-accent-2/20 rounded-xl">
               <h4 className="font-bold text-accent-2 mb-2">The math of DCA</h4>
               <p className="text-sm text-muted mb-4">
                 When the market is down, your fixed $500 buys <strong>more shares</strong>. When the market is up, it buys <strong>fewer shares</strong>.
                 This naturally lowers your average cost per share.
               </p>
               <BlockMath math="\text{Avg Cost} = \frac{\text{Total \$ Invested}}{\text{Total Shares}}" />
             </div>
           </div>
         )
       },
       {
         id: "l4-3",
         title: "Rebalancing",
         duration: "15 min",
         content: (
            <div className="space-y-5 font-sans text-foreground">
               <h3 className="text-3xl font-bold tracking-tight">Maintenance</h3>
               <p className="text-lg text-muted">
                 If stocks double, your 60/40 portfolio might become 80/20. You are now taking more risk than you intended.
                 Rebalancing forces you to <strong>Sell High</strong> (the winners) and <strong>Buy Low</strong> (the laggards).
               </p>
               <ul className="list-disc pl-5 text-muted space-y-2">
                 <li>Rebalance annually or when bands drift by 5%.</li>
                 <li>Prevents "Style Drift."</li>
                 <li>Enforces discipline.</li>
               </ul>
            </div>
         )
       }
    ],
    quiz: [
      {
        id: "q4-1",
        question: "Asset Allocation determines approximately what % of portfolio variance?",
        options: ["10%", "50%", "90%", "100%"],
        correctIndex: 2,
        explanation: "Studies famously show that about 90% of return variability is due to allocation (stocks vs bonds), not individual security selection."
      },
      {
        id: "q4-2",
        question: "The primary benefit of Dollar Cost Averaging (DCA) is:",
        options: ["Guaranteed highest returns", "Eliminating emotional timing decisions", "Avoiding all taxes", "Getting dividends faster"],
        correctIndex: 1,
        explanation: "DCA automates investing, removing the fear/greed cycle of trying to time the market perfectly."
      },
      {
        id: "q4-3",
        question: "Rebalancing involves:",
        options: ["Selling winners to buy losers", "Selling losers to buy winners", "Selling everything to cash", "Buying only new IPOs"],
        correctIndex: 0,
        explanation: "Rebalancing restores your target risk profile. To do this, you must trim assets that have grown (Sell High) and add to assets that have shrunk (Buy Low)."
      },
      {
        id: "q4-4",
        question: "A '60/40' portfolio typically refers to:",
        options: ["60% Cash, 40% Gold", "60% Stocks, 40% Bonds", "60% Domestic, 40% International", "60% Bitcoin, 40% Ether"],
        correctIndex: 1,
        explanation: "The 60/40 is the classic benchmark portfolio balancing growth (stocks) and stability (bonds)."
      },
      {
        id: "q4-5",
        question: "If your stock allocation grows too large relative to bonds, your portfolio has become:",
        options: ["Less risky", "More risky", "Risk neutral", "Tax exempt"],
        correctIndex: 1,
        explanation: "Stocks are riskier than bonds. If they take over a larger % of the portfolio, the aggregate risk of the portfolio increases."
      }
    ]
  },

  // ------------------------------------------------------------------
  // MODULE 5: PSYCHOLOGY
  // ------------------------------------------------------------------
  {
    id: "m5",
    title: "Module 5: Psychology",
    description: "Master your mind. Investing is 20% numbers and 80% behavior.",
    icon: <Brain className="w-5 h-5" />,
    lessons: [
      {
        id: "l5-1",
        title: "Bias & Emotion",
        duration: "15 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">The Lizard Brain</h3>
            <p className="text-lg text-muted">
              We are evolved to survive on the savannah, not trade stocks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-5 bg-card border border-border rounded-xl">
                 <h4 className="font-bold text-lg mb-2">Confirmation Bias</h4>
                 <p className="text-sm text-muted">Ignoring negative news about a stock you own, while obsessing over positive news.</p>
              </div>
              <div className="p-5 bg-card border border-border rounded-xl">
                 <h4 className="font-bold text-lg mb-2">Loss Aversion</h4>
                 <p className="text-sm text-muted">The pain of losing $100 is psychologically 2x stronger than the joy of gaining $100.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "l5-2",
        title: "FOMO & Discipline",
        duration: "15 min",
        content: (
           <div className="space-y-5 font-sans text-foreground">
             <h3 className="text-3xl font-bold tracking-tight">Fear Of Missing Out</h3>
             <p className="text-lg text-muted">
               FOMO usually strikes at market tops. When your neighbor is getting rich on a speculative asset, that is usually the worst time to buy.
             </p>
             <div className="p-6 border-l-4 border-l-accent bg-card/50 rounded-r-xl">
               <p className="italic text-xl font-medium">
                 "The stock market is a device for transferring money from the impatient to the patient."
               </p>
               <p className="text-sm mt-3 text-muted">— Warren Buffett</p>
             </div>
           </div>
        )
      }
    ],
    quiz: [
      {
        id: "q5-1",
        question: "Loss Aversion suggests that:",
        options: ["We prefer losing money to gaining it", "The pain of loss is stronger than the joy of gain", "We should avoid all losses at any cost", "Losses don't matter"],
        correctIndex: 1,
        explanation: "Psychological studies show the emotional impact of a loss is roughly twice that of an equivalent gain."
      },
      {
        id: "q5-2",
        question: "Confirmation Bias leads investors to:",
        options: ["Seek out opposing viewpoints", "Diversify their portfolio", "Only look for info that supports their current beliefs", "Sell everything"],
        correctIndex: 2,
        explanation: "It is the tendency to interpret new evidence as confirmation of one's existing theories."
      },
      {
        id: "q5-3",
        question: "FOMO (Fear Of Missing Out) often causes investors to:",
        options: ["Buy at the top", "Buy at the bottom", "Sell too early", "Research thoroughly"],
        correctIndex: 0,
        explanation: "FOMO drives investors to chase performance, usually resulting in buying assets that are already over-hyped and expensive."
      },
      {
        id: "q5-4",
        question: "The quote 'The market transfers money from the impatient to the patient' is attributed to:",
        options: ["Elon Musk", "Warren Buffett", "Adam Smith", "Jerome Powell"],
        correctIndex: 1,
        explanation: "Warren Buffett is famous for emphasizing patience and long-term holding periods."
      },
      {
        id: "q5-5",
        question: "What is the best antidote to emotional trading?",
        options: ["Checking prices every hour", "Having a written plan/strategy", "Listening to TV pundits", "Using high leverage"],
        correctIndex: 1,
        explanation: "A pre-defined plan (like DCA and allocation rules) removes the need to make emotional decisions in the heat of the moment."
      }
    ]
  },

  // ------------------------------------------------------------------
  // MODULE 6: ADVANCED METRICS
  // ------------------------------------------------------------------
  {
    id: "m6",
    title: "Module 6: Advanced Metrics",
    description: "Quantifying risk. Beta, Sharpe Ratio, and Standard Deviation.",
    icon: <Calculator className="w-5 h-5" />,
    lessons: [
      {
        id: "l6-1",
        title: "Beta & Volatility",
        duration: "15 min",
        content: (
          <div className="space-y-5 font-sans text-foreground">
            <h3 className="text-3xl font-bold tracking-tight">Measuring Movement</h3>
            <p className="text-lg text-muted">
              Beta measures a stock's volatility in relation to the overall market (S&P 500).
            </p>
            <div className="space-y-3 mt-4">
               <div className="flex justify-between items-center p-4 bg-card rounded border border-border">
                  <span className="font-mono font-bold">Beta = 1.0</span>
                  <span className="text-sm text-muted">Moves exactly with the market.</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-card rounded border border-border">
                  <span className="font-mono font-bold text-red-500">Beta &gt; 1.0</span>
                  <span className="text-sm text-muted">More volatile (Aggressive).</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-card rounded border border-border">
                  <span className="font-mono font-bold text-accent-2">Beta &lt; 1.0</span>
                  <span className="text-sm text-muted">Less volatile (Defensive).</span>
               </div>
            </div>
          </div>
        )
      },
      {
        id: "l6-2",
        title: "The Sharpe Ratio",
        duration: "20 min",
        content: (
          <div className="space-y-6 font-sans text-foreground">
             <h3 className="text-3xl font-bold tracking-tight">Risk-Adjusted Return</h3>
             <p className="text-lg text-muted">
               Did you make money because you're smart, or because you took reckless risks? The Sharpe Ratio reveals the truth.
             </p>
             <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl">
               <BlockMath math="\text{Sharpe} = \frac{R_p - R_f}{\sigma_p}" />
               <div className="mt-4 text-sm space-y-2 text-muted">
                 <p><InlineMath math="R_p" /> = Portfolio Return</p>
                 <p><InlineMath math="R_f" /> = Risk-Free Rate</p>
                 <p><InlineMath math="\sigma_p" /> = Standard Deviation (Volatility)</p>
               </div>
             </div>
             <p className="text-sm mt-4 text-muted">
               <strong>Score:</strong> &gt;1 is Good. &gt;2 is Very Good. &gt;3 is Excellent.
             </p>
          </div>
        )
      }
    ],
    quiz: [
      {
        id: "q6-1",
        question: "A Beta of 1.5 indicates the stock is:",
        options: ["50% less volatile than the market", "50% more volatile than the market", "Equal to the market", "Risk free"],
        correctIndex: 1,
        explanation: "Beta > 1 implies higher volatility. If the market goes up 10%, a 1.5 Beta stock might go up 15% (and fall 15% on the downside)."
      },
      {
        id: "q6-2",
        question: "The Sharpe Ratio measures:",
        options: ["Total Return", "Maximum Drawdown", "Risk-Adjusted Return", "Dividends only"],
        correctIndex: 2,
        explanation: "It calculates how much 'excess return' you are receiving for the extra volatility you are enduring."
      },
      {
        id: "q6-3",
        question: "In the Sharpe formula, what is subtracted from the Portfolio Return?",
        options: ["Inflation", "The Risk-Free Rate", "The S&P 500 Return", "Fees"],
        correctIndex: 1,
        explanation: "You subtract the Risk-Free Rate because that is the return you could have gotten for doing absolutely nothing."
      },
      {
        id: "q6-4",
        question: "A stock with a Beta of 0.5 is considered:",
        options: ["High Growth", "Defensive", "Speculative", "Bankrupt"],
        correctIndex: 1,
        explanation: "Low beta stocks (like Utilities) move less than the market, offering defense during crashes."
      },
      {
        id: "q6-5",
        question: "Standard Deviation is a statistical measure of:",
        options: ["Profit", "Volatility/Dispersion", "Debt", "Liquidity"],
        correctIndex: 1,
        explanation: "In finance, Standard Deviation is the primary metric for volatility—how far returns swing from the average."
      }
    ]
  }
];