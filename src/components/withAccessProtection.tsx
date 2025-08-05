import React from 'react'
import AccessProtection from './AccessProtection'

interface WithAccessProtectionOptions {
  loadingComponent?: React.ReactNode
  fallbackComponent?: React.ReactNode
}

export function withAccessProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithAccessProtectionOptions
) {
  const ProtectedComponent = (props: P) => {
    return (
      <AccessProtection 
        loadingComponent={options?.loadingComponent}
        fallbackComponent={options?.fallbackComponent}
      >
        <WrappedComponent {...props} />
      </AccessProtection>
    )
  }

  ProtectedComponent.displayName = `withAccessProtection(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return ProtectedComponent
}

export default withAccessProtection
