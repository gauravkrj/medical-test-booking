'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full text-center">
        <div className="glass rounded-2xl p-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
              <span className="text-6xl font-bold text-purple-400">404</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Page Not Found
          </h1>
          
          <p className="text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 gradient-primary text-white hover:scale-105 rounded-xl font-semibold transition-all duration-300">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </Link>
            
            <Link href="/tests">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 glass text-gray-300 border border-white/10 hover:bg-white/10 rounded-xl font-semibold transition-all duration-300">
                <Search className="w-4 h-4 mr-2" />
                Browse Tests
              </button>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 glass text-gray-300 border border-white/10 hover:bg-white/10 rounded-xl font-semibold transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

