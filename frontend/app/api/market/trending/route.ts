import { NextResponse } from 'next/server';
import yf from '../yf';

export async function GET() {
  try {
    const trending = await yf.trendingSymbols('US', { count: 6 }, { validateResult: false });
    const symbols: string[] = trending.quotes.map((q: { symbol: string }) => q.symbol);
    const quotes = await yf.quote(symbols, {}, { validateResult: false });
    return NextResponse.json(
      quotes.map((q: { symbol: string; regularMarketPrice?: number; regularMarketChangePercent?: number }) => ({
        sym: q.symbol,
        price: q.regularMarketPrice?.toFixed(2) || 0,
        change: q.regularMarketChangePercent?.toFixed(2) || 0
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
