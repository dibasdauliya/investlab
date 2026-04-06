import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const plaidEnv = (process.env.PLAID_ENV ?? 'sandbox') as keyof typeof PlaidEnvironments;

const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[plaidEnv],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
        'PLAID-SECRET': process.env.PLAID_SECRET ?? '',
      },
    },
  })
);

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

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('plaid_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ accounts: DEMO_ACCOUNTS, demo: true });
  }

  try {
    const response = await plaid.accountsBalanceGet({ access_token: accessToken });
    const accounts = response.data.accounts.map((acc) => ({
      id: acc.account_id,
      name: acc.name,
      type: acc.subtype ?? acc.type,
      mask: acc.mask ?? '****',
      balance: acc.balances.current ?? acc.balances.available ?? 0,
      institution: response.data.item.institution_id ?? 'Bank',
    }));
    return NextResponse.json({ accounts, demo: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
