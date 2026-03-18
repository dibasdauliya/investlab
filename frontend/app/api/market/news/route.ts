import { NextRequest, NextResponse } from 'next/server';
import yf from '../yf';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker');
  try {
    const query = ticker || 'finance';
    const result = await yf.search(query, { newsCount: 6, quotesCount: 0 }, { validateResult: false });
    return NextResponse.json(result.news || []);
  } catch {
    return NextResponse.json([]);
  }
}
