export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface LoadingSpinnerProps {
  size?: SpinnerSize
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-transparent border-t-sky-600 border-r-purple-600 ${sizeStyles[size]}`}
        style={{
          background: 'transparent',
        }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
