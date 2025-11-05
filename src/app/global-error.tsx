'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global application error:', error)
    }

    // In production, you could log to an error reporting service
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-md w-full text-center">
            <div className="glass rounded-2xl p-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Application Error
              </h1>
              
              <p className="text-gray-400 mb-6">
                A critical error occurred. Please refresh the page or contact support if the problem persists.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                  <p className="text-red-300 text-sm font-mono mb-2">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-400">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center px-6 py-3.5 gradient-primary text-white hover:scale-105 rounded-xl font-semibold transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <Link href="/">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 glass text-gray-300 border border-white/10 hover:bg-white/10 rounded-xl font-semibold transition-all duration-300">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

