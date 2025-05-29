import { NextRequest, NextResponse } from 'next/server'

const AUTH_BACKEND_URL = process.env.BACKEND_API!

async function handle(req: NextRequest, path: string[]) {
  const url = `${AUTH_BACKEND_URL}/${path.join('/')}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const method = req.method
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.text()

  const backendRes = await fetch(url, {
    method,
    headers,
    body,
    credentials: 'include'
  })
  console.log('Set-Cookie headers:', backendRes.headers.get('set-cookie'))

  const responseBody = await backendRes.text()

  const resHeaders = new Headers()
  const setCookieHeader = backendRes.headers.get('set-cookie')
  if (setCookieHeader) {
    resHeaders.set('Set-Cookie', setCookieHeader)
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
