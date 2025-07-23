'use client'

import { useSearchParams } from 'next/navigation'

export default function OAuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing_code':
        return 'Authorization code is missing. Please try logging in again.'
      case 'missing_state':
        return 'State parameter is missing. Please try logging in again.'
      case 'invalid_state':
        return 'Invalid state parameter. Please try logging in again.'
      case 'code_exchange_failed':
        return 'Failed to exchange authorization code. Please try logging in again.'
      default:
        return 'An authentication error occurred. Please try logging in again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Error</h3>
          <p className="mt-1 text-sm text-gray-500">
            {getErrorMessage(error)}
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/api/oauth/init'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
