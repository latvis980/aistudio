// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware runs on every request.
 * - Sets a default 'lang' cookie if none exists
 * - Blocks /admin routes if not authenticated (future)
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set default lang cookie if not present
  const langCookie = request.cookies.get('lang')
  if (!langCookie) {
    response.cookies.set('lang', 'en', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
