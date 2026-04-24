// app/(public)/not-found.tsx

import BracketLink from '@/components/ui/BracketLink'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-[6rem] font-light text-muted leading-none mb-4">404</h1>
      <p className="text-body text-muted mb-8">Page not found</p>
      <BracketLink href="/">Back to Home</BracketLink>
    </div>
  )
}
