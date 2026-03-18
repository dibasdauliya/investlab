import { NextRequest, NextResponse } from 'next/server';
import yf from '../yf';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q) return NextResponse.json([]);
  try {
    const result = await yf.search(q, { quotesCount: 5, newsCount: 0 }, { validateResult: false });
    return NextResponse.json(result.quotes.filter((r: { isYahooFinance?: boolean }) => r.isYahooFinance));
  } catch {
    return NextResponse.json([]);
  }
}
