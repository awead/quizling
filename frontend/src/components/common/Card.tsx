import type { ReactNode } from 'react'

export type CardVariant = 'default' | 'glass' | 'elevated'

export interface CardProps {
  children: ReactNode
  variant?: CardVariant
  className?: string
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft hover:shadow-lg',
  glass:
    'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-soft hover:shadow-lg',
  elevated:
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-4 border-t-sky-500 shadow-lg hover:shadow-xl',
}

export default function Card({
  children,
  variant = 'default',
  className = '',
}: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 transition-all duration-300 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  )
}
