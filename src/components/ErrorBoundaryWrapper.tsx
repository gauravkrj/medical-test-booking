'use client'

import { ErrorBoundary } from './ErrorBoundary'

/**
 * Wrapper component to easily add error boundaries to any component tree
 */
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

