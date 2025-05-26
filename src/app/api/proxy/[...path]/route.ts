import { NextRequest, NextResponse } from 'next/server'

const AUTH_BACKEND_URL = process.env.BACKEND_API!

async function handle(req: NextRequest, path: string[]) {
  const url = `${AUTH_BACKEND_URL}/${path.join('/')}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const cookie = req.headers.get('cookie')
  if (cookie) headers['cookie'] = cookie

  const method = req.method
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.text()

  const backendRes = await fetch(url, {
    method,
    // headers,
    body,
    credentials: 'include'
  })

  const responseBody = await backendRes.text()

  const response = new NextResponse(responseBody, {
    status: backendRes.status
  })

  const setCookie = backendRes.headers.getSetCookie?.()
  if (setCookie) {
    // Can be string or array
    if (Array.isArray(setCookie)) {
      setCookie.forEach((cookie) =>
        response.headers.append('Set-Cookie', cookie)
      )
    } else {
      response.headers.set('Set-Cookie', setCookie)
    }
  }

  return response
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
