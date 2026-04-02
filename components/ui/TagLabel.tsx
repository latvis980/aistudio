import { cn } from '@/lib/utils'

interface TagLabelProps {
  children: React.ReactNode
  className?: string
}

export default function TagLabel({ children, className }: TagLabelProps) {
  return (
    <span className={cn('tag-label', className)}>
      {children}
    </span>
  )
}
