// app/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin-auth', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}