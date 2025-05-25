import type { NextApiRequest, NextApiResponse } from 'next'

const CHAT_BACKEND_URL = process.env.CHAT_BACKEND_API!

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = (req.query.path as string[]).join('/')
  const url = `${CHAT_BACKEND_URL}/${path}`

  try {
    const backendRes = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        }),
        cookie: req.headers.cookie || ''
      },
      body: ['GET', 'HEAD'].includes(req.method!)
        ? undefined
        : JSON.stringify(req.body)
    })

    const data = await backendRes.json()
    res.status(backendRes.status).json(data)
  } catch (error) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error)
    res.status(500).json({ message: 'Proxy error', error: errorMessage })
  }
}
