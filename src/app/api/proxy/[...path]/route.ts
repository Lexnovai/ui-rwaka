import { NextRequest, NextResponse } from 'next/server'

const AUTH_BACKEND_URL = process.env.BACKEND_API!

async function handle(req: NextRequest, path: string[]) {
  const url = `${AUTH_BACKEND_URL}/${path.join('/')}`

  // Forward all relevant headers, including cookies
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    cookie: req.headers.get('cookie') || '',
    origin: req.headers.get('origin') || req.headers.get('host') || ''
  }

  // Forward additional headers that might be needed for auth
  const headersToForward = [
    'authorization',
    'user-agent',
    'accept',
    'accept-language',
    'x-forwarded-for',
    'x-real-ip'
  ]

  headersToForward.forEach((header) => {
    const value = req.headers.get(header)
    if (value) {
      headers[header] = value
    }
  })

  const method = req.method
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.text()

  console.log('Proxying request:', {
    method,
    url,
    cookies: req.headers.get('cookie'),
    headers: Object.keys(headers)
  })

  const backendRes = await fetch(url, {
    method,
    headers,
    body
  })

  const responseBody = await backendRes.text()

  console.log('Backend response:', {
    status: backendRes.status,
    headers: Array.from(backendRes.headers.entries()),
    hasSetCookie: backendRes.headers.has('set-cookie')
  })

  const resHeaders = new Headers()

  // Forward all headers from backend response
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      resHeaders.append('set-cookie', value)
    } else {
      resHeaders.set(key, value)
    }
  })

  // Add CORS headers for production
  resHeaders.set('Access-Control-Allow-Credentials', 'true')
  const origin = req.headers.get('origin')
  if (origin) {
    resHeaders.set('Access-Control-Allow-Origin', origin)
  }

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: resHeaders
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handle(req, resolvedParams.path)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handle(req, resolvedParams.path)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handle(req, resolvedParams.path)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handle(req, resolvedParams.path)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handle(req, resolvedParams.path)
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = new Headers()

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
  }
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  )
  headers.set('Access-Control-Max-Age', '86400')

  return new NextResponse(null, {
    status: 200,
    headers
  })
}
