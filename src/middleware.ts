import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Basic in-memory rate limiting for Edge (per isolate)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting Logic (Chống Spam API)
  if (request.nextUrl.pathname.startsWith('/api/') || request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 60; // 60 requests per minute per IP

    const record = rateLimitMap.get(ip) || { count: 0, timestamp: now };
    
    // Reset window if passed
    if (now - record.timestamp > windowMs) {
      record.count = 0;
      record.timestamp = now;
    }

    record.count += 1;
    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // 2. Tiếp tục chạy Auth Middleware của Supabase
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
