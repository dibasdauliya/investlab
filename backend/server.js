// backend/server.js
const express = require('express');
const cors = require('cors');
const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const formatNumber = (num) => {
  if (!num) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toLocaleString();
};

const getStartDate = (timeframe) => {
  const date = new Date();
  switch (timeframe) {
    case '1D': date.setDate(date.getDate() - 1); break;
    case '5D': date.setDate(date.getDate() - 5); break;
    case '1M': date.setMonth(date.getMonth() - 1); break;
    case '6M': date.setMonth(date.getMonth() - 6); break;
    case '1Y': date.setFullYear(date.getFullYear() - 1); break;
    default: date.setMonth(date.getMonth() - 1);
  }
  return date;
};

const getInterval = (timeframe) => {
  if (timeframe === '1D') return '5m';
  if (timeframe === '5D') return '15m';
  return '1d';
};

app.get('/api/market/data', async (req, res) => {
  const { ticker, timeframe = '1M' } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

  const sym = ticker.toUpperCase();
  const period1 = getStartDate(timeframe);
  const interval = getInterval(timeframe);

  try {
    const [chartResult, quoteResult] = await Promise.all([
      yahooFinance.chart(sym, { period1, interval }),
      yahooFinance.quote(sym)
    ]);

    const chartData = chartResult.quotes
      .filter(q => q.close !== null)
      .map(q => ({
        time: new Date(q.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: Number(q.close?.toFixed(2))
      }));

    const currentPrice = quoteResult.regularMarketPrice || 0;
    const startPrice = chartData.length > 0 ? chartData[0].price : currentPrice;
    const percentChange = startPrice ? (((currentPrice - startPrice) / startPrice) * 100).toFixed(2) : "0.00";

    res.json({
      ticker: sym,
      name: quoteResult.shortName || quoteResult.longName || sym,
      price: currentPrice,
      change: parseFloat(percentChange),
      chart: chartData,
      stats: {
        open: quoteResult.regularMarketOpen?.toFixed(2) || 'N/A',
        high: quoteResult.regularMarketDayHigh?.toFixed(2) || 'N/A',
        low: quoteResult.regularMarketDayLow?.toFixed(2) || 'N/A',
        prevClose: quoteResult.regularMarketPreviousClose?.toFixed(2) || 'N/A',
        vol: formatNumber(quoteResult.regularMarketVolume),
        exchange: quoteResult.exchange || 'N/A',
        mktCap: formatNumber(quoteResult.marketCap),
        peRatio: quoteResult.trailingPE?.toFixed(2) || 'N/A',
        dividend: quoteResult.trailingAnnualDividendYield ? (quoteResult.trailingAnnualDividendYield * 100).toFixed(2) + '%' : 'N/A'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

app.get('/api/market/trending', async (req, res) => {
  try {
    const trending = await yahooFinance.trendingSymbols('US', { count: 6 });
    const quotes = await yahooFinance.quote(trending.quotes.map(q => q.symbol));
    res.json(quotes.map(q => ({
      sym: q.symbol, price: q.regularMarketPrice?.toFixed(2) || 0, change: q.regularMarketChangePercent?.toFixed(2) || 0
    })));
  } catch (error) { res.status(500).json([]); }
});

app.get('/api/market/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const result = await yahooFinance.search(q, { quotesCount: 5, newsCount: 0 });
    res.json(result.quotes.filter(q => q.isYahooFinance));
  } catch (error) { res.status(500).json([]); }
});

// FIX: Specifically searches the provided ticker for relevant news
app.get('/api/market/news', async (req, res) => {
  const { ticker } = req.query;
  try {
    const query = ticker || 'finance'; 
    const result = await yahooFinance.search(query, { newsCount: 6, quotesCount: 0 });
    res.json(result.news || []);
  } catch (error) { 
    res.status(500).json([]); 
  }
});

app.listen(PORT, () => console.log(`[SYS] Financial Backend running on http://localhost:${PORT}`));