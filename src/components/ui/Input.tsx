"use client"

import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id || React.useId()
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={[
            'w-full px-4 py-3.5 glass rounded-xl text-white placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all',
            error ? 'border border-red-500/40 bg-red-500/5' : 'border border-white/10',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

