import { NextRequest, NextResponse } from 'next/server'

const AUTH_BACKEND_URL = process.env.BACKEND_API!

async function handle(req: NextRequest, path: string[]) {
  const url = `${AUTH_BACKEND_URL}/${path.join('/')}`

  // Prepare headers for backend request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Forward authorization header if present
  const auth = req.headers.get('authorization')
  if (auth) {
    headers['Authorization'] = auth
  }

  // Forward cookies to backend
  const cookie = req.headers.get('cookie')
  if (cookie) {
    headers['Cookie'] = cookie
  }

  // Forward origin and other important headers
  const origin = req.headers.get('origin')
  if (origin) {
    headers['Origin'] = origin
  }

  const referer = req.headers.get('referer')
  if (referer) {
    headers['Referer'] = referer
  }

  // Prepare request body
  const method = req.method
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.text()

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Proxying ${method} ${url}`)
    console.log('Request headers:', headers)
    if (body) console.log('Request body:', body)
  }

  try {
    // Make request to backend
    const backendRes = await fetch(url, {
      method,
      headers,
      body,
      credentials: 'include'
    })

    const responseBody = await backendRes.text()

    // Create response
    const response = new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText
    })

    // Forward response headers from backend (excluding set-cookie)
    backendRes.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (lowerKey !== 'set-cookie' && lowerKey !== 'content-encoding') {
        response.headers.set(key, value)
      }
    })

    // Handle cookies properly
    const setCookieHeaders = backendRes.headers.getSetCookie?.()
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Backend Set-Cookie headers:', setCookieHeaders)
      }

      // Forward all Set-Cookie headers
      setCookieHeaders.forEach((cookieHeader) => {
        response.headers.append('Set-Cookie', cookieHeader)
      })
    }

    // Alternative method for older Node.js versions
    const setCookieHeader = backendRes.headers.get('set-cookie')
    if (setCookieHeader && !setCookieHeaders) {
      response.headers.set('Set-Cookie', setCookieHeader)
    }

    // Add CORS headers if needed
    const requestOrigin = req.headers.get('origin')
    if (requestOrigin) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Debug logging
    console.log('Response status:', backendRes.status)
    console.log(
      'Response Set-Cookie headers being sent:',
      response.headers.get('Set-Cookie')
    )

    return response
  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse(
      JSON.stringify({
        message: 'Proxy server error',
        error:
          process.env.NODE_ENV === 'development'
            ? String(error)
            : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
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
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 })

  const requestOrigin = req.headers.get('origin')
  if (requestOrigin) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  )
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}
