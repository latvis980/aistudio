import { cn } from '@/lib/utils'

interface TagLabelProps {
  children: React.ReactNode
  className?: string
  plain?: boolean
}

export default function TagLabel({ children, className, plain }: TagLabelProps) {
  return (
    <span className={cn('tag-label', plain && 'cursor-default pointer-events-none hover:text-muted', className)}>
      {children}
    </span>
  )
}
