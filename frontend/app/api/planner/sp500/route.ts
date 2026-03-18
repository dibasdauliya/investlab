import { NextResponse } from 'next/server';
import yf from '../../market/yf';

const SP500_PICKS = [
  { ticker: 'AAPL', reason: 'Consumer electronics & services with consistent dividend growth' },
  { ticker: 'MSFT', reason: 'Cloud computing & AI powerhouse with strong recurring revenue' },
  { ticker: 'NVDA', reason: 'AI chip market dominance — powering data centers worldwide' },
  { ticker: 'AMZN', reason: 'E-commerce giant with AWS as the #1 cloud provider' },
  { ticker: 'GOOGL', reason: 'Search & AI leader with diverse, high-margin ad revenue' },
  { ticker: 'META', reason: 'Social media monopoly with 3B+ users and growing ad platform' },
  { ticker: 'TSLA', reason: 'EV & energy storage innovator with expanding margins' },
  { ticker: 'JPM', reason: 'Largest US bank — stable, diversified financial services' },
  { ticker: 'V', reason: 'Global payments network processing $15T+ annually' },
  { ticker: 'AVGO', reason: 'Semiconductor & AI networking chips with strong cash flow' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      SP500_PICKS.map(async ({ ticker, reason }) => {
        try {
          const q = await yf.quote(ticker, {}, { validateResult: false });
          return {
            ticker,
            reason,
            name: q.shortName || q.longName || ticker,
            price: q.regularMarketPrice || 0,
            change: q.regularMarketChangePercent || 0,
            marketCap: q.marketCap || 0,
            fiftyTwoWeekHigh: q.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: q.fiftyTwoWeekLow || 0,
            peRatio: q.trailingPE || null,
          };
        } catch {
          return null;
        }
      })
    );
    return NextResponse.json(results.filter(Boolean));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
