import { NextRequest, NextResponse } from 'next/server'

const AUTH_BACKEND_URL = process.env.BACKEND_API!

export async function handle(req: NextRequest, path: string[]) {
  const url = `${AUTH_BACKEND_URL}/${path.join('/')}`

  const incomingCookies = req.headers.get('cookie')
  console.log('🍪 Incoming cookies from client:', incomingCookies)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const cookie = req.headers.get('cookie')
  if (cookie) {
    headers['cookie'] = cookie
    console.log('🍪 Forwarding cookies to backend:', cookie)
  } else {
    console.log('❌ No cookies to forward!')
  }

  const method = req.method
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.text()

  const backendRes = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include'
  })

  const responseBody = await backendRes.text()

  // ✅ FIXED: Actually copy all headers from backend response
  const resHeaders = new Headers()
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      console.log('🍪 Backend setting cookies:', value)
      resHeaders.append('set-cookie', value) // ← This was missing!
    } else {
      resHeaders.set(key, value)
    }
  })

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: resHeaders
  })
}
