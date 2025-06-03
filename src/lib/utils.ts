import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateText = (text: string, limit: number) => {
  if (text) {
    return text.length > limit ? `${text.slice(0, limit)}..` : text
  }
  return ''
}

export const isValidUrl = (url: string): boolean => {
  try {
    const pattern = new RegExp(
      '^https?:\\/\\/' +
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' +
        'localhost|' +
        '\\d{1,3}(\\.\\d{1,3}){3})' +
        '(\\:\\d+)?' +
        '(\\/[-a-zA-Z\\d%@_.~+&:]*)*' +
        '(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?' +
        '(\\#[-a-zA-Z\\d_]*)?$',
      'i'
    )

    return pattern.test(url.trim())
  } catch {
    return false
  }
}

export const getJsonMarkdown = (content: object = {}) => {
  let jsonBlock = ''
  try {
    jsonBlock = `\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``
  } catch {
    jsonBlock = `\`\`\`\n${String(content)}\n\`\`\``
  }

  return jsonBlock
}

// export function getAuthToken(): string | null {
//   if (typeof window === 'undefined') return null
//   const params = new URLSearchParams(window.location.search)
//   const token = params.get('token')
//   if (token) return token

//   return localStorage.getItem('accessToken')
// }
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  // First check sessionStorage (from PostMessage)
  const sessionToken = sessionStorage.getItem('accessToken')
  if (sessionToken) return sessionToken

  // Fallback to localStorage for backward compatibility
  return localStorage.getItem('accessToken')
}

// Initialize PostMessage listener and auth app
export function initializeAuthListener(expectedOrigin: string) {
  const allowedDomain = '.rwaka.rw'
  if (typeof window === 'undefined') return

  window.addEventListener('message', (event) => {
    // Verify origin for security - replace with your actual login domain
    if (!event.origin.endsWith(allowedDomain)) {
      console.warn('Received message from unauthorized origin:', event.origin)
      return
    }

    if (event.data.type === 'AUTH_TOKEN') {
      const token = event.data.token

      // Store in sessionStorage (more secure than localStorage for tokens)
      sessionStorage.setItem('accessToken', token)

      // Clean URL if there are any leftover query params
      const url = new URL(window.location.href)
      url.searchParams.delete('token') // Remove any old token params
      window.history.replaceState({}, document.title, url.pathname + url.search)

      // Close the communication window if it was a popup
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_SUCCESS' }, expectedOrigin)
      }

      // Proceed with authenticated app
      initializeAuthenticatedApp(token)

      // Optionally reload the page or update UI state
      window.location.reload()
    }
  })
}

function initializeAuthenticatedApp(token: string) {
  // Set up your authenticated requests with the token
  // Configure axios/fetch interceptors, etc.
  console.log('User authenticated successfully')

  // You can dispatch events or update global state here
  window.dispatchEvent(
    new CustomEvent('authTokenReceived', { detail: { token } })
  )
}
