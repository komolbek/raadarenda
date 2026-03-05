import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()
  const { method, url, nextUrl } = request
  const pathname = nextUrl.pathname

  // Only log API requests
  if (pathname.startsWith('/api/')) {
    // Get request details
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const contentType = request.headers.get('content-type') || 'none'
    const language = request.headers.get('x-language') || 'en'
    const hasAuth = request.headers.has('authorization')

    // Log request start
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📥 ${method} ${pathname}`)
    console.log(`   Time: ${new Date().toISOString()}`)
    console.log(`   Auth: ${hasAuth ? '✓' : '✗'}`)
    console.log(`   Lang: ${language}`)
    console.log(`   Content-Type: ${contentType}`)
    console.log(`   User-Agent: ${userAgent.substring(0, 50)}...`)

    // Log query params if present
    const searchParams = nextUrl.searchParams.toString()
    if (searchParams) {
      console.log(`   Query: ${searchParams}`)
    }
  }

  // Continue with the request
  const response = NextResponse.next()

  // Add request ID header for tracing
  const requestId = crypto.randomUUID().substring(0, 8)
  response.headers.set('x-request-id', requestId)

  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/api/:path*',
}
