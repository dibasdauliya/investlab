import { NextResponse } from 'next/server';

// Demo accounts used when Plaid credentials are not configured.
// To enable real Plaid integration:
//  1. Install: npm install plaid
//  2. Add to .env: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV (sandbox|development|production)
//  3. Create /api/planner/link-token and /api/planner/exchange routes
//  4. Replace the demo return below with real Plaid accountsBalanceGet() call
const DEMO_ACCOUNTS = [
  {
    id: 'demo-checking',
    name: 'Checking Account',
    type: 'checking',
    mask: '4567',
    balance: 4250.0,
    institution: 'Chase Bank',
  },
  {
    id: 'demo-savings',
    name: 'High-Yield Savings',
    type: 'savings',
    mask: '8901',
    balance: 12800.0,
    institution: 'Chase Bank',
  },
];

export async function GET() {
  return NextResponse.json({ accounts: DEMO_ACCOUNTS, demo: true });
}
