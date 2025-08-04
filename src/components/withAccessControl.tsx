'use client'

import React from 'react'
import AccessGuard from './AccessGuard'

interface WithAccessControlOptions {
  loadingComponent?: React.ReactNode
  fallbackComponent?: React.ReactNode
  redirectOnDenied?: boolean
  onAccessDenied?: (error: string) => void
}

/**
 * Higher-order component that wraps a component with access control
 * @param WrappedComponent - The component to protect
 * @param options - Configuration options for access control
 * @returns Protected component
 */
export function withAccessControl<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAccessControlOptions = {}
) {
  const {
    loadingComponent,
    fallbackComponent,
    redirectOnDenied = true,
    onAccessDenied
  } = options

  const ProtectedComponent = (props: P) => {
    return (
      <AccessGuard
        loadingComponent={loadingComponent}
        fallbackComponent={fallbackComponent}
        redirectOnDenied={redirectOnDenied}
        onAccessDenied={onAccessDenied}
      >
        <WrappedComponent {...props} />
      </AccessGuard>
    )
  }

  // Set display name for debugging
  ProtectedComponent.displayName = `withAccessControl(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return ProtectedComponent
}

export default withAccessControl
