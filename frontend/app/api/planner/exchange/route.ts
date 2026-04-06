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

export async function POST(req: NextRequest) {
  const { public_token } = await req.json();

  if (!public_token) {
    return NextResponse.json({ error: 'public_token required' }, { status: 400 });
  }

  try {
    const response = await plaid.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;

    const res = NextResponse.json({ ok: true });
    // Store access token in a secure httpOnly cookie (server-only, not readable by JS)
    res.cookies.set('plaid_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
