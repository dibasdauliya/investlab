import { NextRequest, NextResponse } from 'next/server';
import yf from '../yf';

const formatNumber = (num: number | undefined | null): string => {
  if (!num) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toLocaleString();
};

const getStartDate = (timeframe: string): Date => {
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

const getInterval = (timeframe: string) => {
  if (timeframe === '1D') return '5m';
  if (timeframe === '5D') return '15m';
  return '1d';
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker');
  const timeframe = searchParams.get('timeframe') || '1M';

  if (!ticker) return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });

  const sym = ticker.toUpperCase();
  const period1 = getStartDate(timeframe);
  const interval = getInterval(timeframe);

  try {
    const [chartResult, quoteResult] = await Promise.all([
      yf.chart(sym, { period1, interval }, { validateResult: false }),
      yf.quote(sym, {}, { validateResult: false })
    ]);

    const chartData = chartResult.quotes
      .filter((q: { close: number | null }) => q.close !== null)
      .map((q: { date: string | Date; close: number }) => ({
        time: new Date(q.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: Number(q.close?.toFixed(2))
      }));

    const currentPrice = quoteResult.regularMarketPrice || 0;
    const startPrice = chartData.length > 0 ? chartData[0].price : currentPrice;
    const percentChange = startPrice ? (((currentPrice - startPrice) / startPrice) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
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
        dividend: quoteResult.trailingAnnualDividendYield
          ? (quoteResult.trailingAnnualDividendYield * 100).toFixed(2) + '%'
          : 'N/A'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/market/data]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
