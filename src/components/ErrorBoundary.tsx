'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import Button from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // In production, you could log to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-md w-full text-center">
            <div className="glass rounded-2xl p-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page or return home.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                  <p className="text-red-300 text-sm font-mono mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-gray-400">
                      <summary className="cursor-pointer text-red-300 mb-2">
                        Stack Trace
                      </summary>
                      <pre className="overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  className="flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Link href="/">
                  <Button variant="secondary" className="w-full sm:w-auto flex items-center justify-center">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

