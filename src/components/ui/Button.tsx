"use client"

import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4 text-lg',
  }
  const variants = {
    primary:
      'gradient-primary text-white hover:scale-105',
    secondary:
      'glass text-gray-300 border border-white/10 hover:bg-white/10',
    ghost:
      'text-gray-300 hover:text-white',
    danger:
      'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30',
  }
  return (
    <button className={[base, sizes[size], variants[variant], className].join(' ')} {...props}>
      {loading && (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
      )}
      {children}
    </button>
  )
}
