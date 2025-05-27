// Centralized wrapper around the native fetch API that automatically
// attaches the Basic-Authentication header using credentials provided
// through environment variables.  This avoids scattering auth logic
// across the codebase and keeps credentials out of the source.

// NOTE: The credentials **must** be exposed to the browser because all
// requests are executed client-side.  Use the `NEXT_PUBLIC_` prefix so
// that Next.js exposes them during build-time.

const username = process.env.NEXT_PUBLIC_API_USERNAME ?? ''
const password = process.env.NEXT_PUBLIC_API_PASSWORD ?? ''

// Build `Authorization: Basic <base64(user:pass)>` header if credentials
// are available; otherwise return an empty object so unauthenticated
// requests continue to work (e.g. CDN asset downloads).
const buildAuthHeader = (): Record<string, string> => {
  if (!username || !password) return {}

  // Works both in the browser and in Node/Edge runtimes used by Next.js
  // during server-side rendering.
  const encoded =
    typeof window === 'undefined'
      ? Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')
      : btoa(`${username}:${password}`)

  return { Authorization: `Basic ${encoded}` }
}

export default async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {})
  // Attach / override with Basic Auth header
  Object.entries(buildAuthHeader()).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return fetch(input, {
    ...init,
    headers
  })
}
