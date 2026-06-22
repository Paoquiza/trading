import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'green' | 'red' | 'blue' | 'gray'
  children: ReactNode
}

const variants = {
  green: 'bg-green-900 text-green-400 border-green-600/30',
  red: 'bg-red-900 text-red-400 border-red-600/30',
  blue: 'bg-accent-500/10 text-accent-400 border-accent-500/30',
  gray: 'bg-dark-700 text-dark-200 border-dark-500',
}

export function Badge({ variant = 'gray', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  )
}
