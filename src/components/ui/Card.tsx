"use client"

import React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'glass' | 'dark'
}

export default function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'glass rounded-xl',
    glass: 'glass rounded-xl',
    dark: 'glass-dark rounded-xl',
  }
  return (
    <div className={[variants[variant], className].join(' ')} {...props}>
      {children}
    </div>
  )
}

