import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/export')) {
    const res = NextResponse.next();
    res.headers.set('x-paywall', 'soft');
    return res;
  }
  return NextResponse.next();
}
export const config = { matcher: ['/export/:path*'] };
