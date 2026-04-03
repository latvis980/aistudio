'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { AdminProjectsProvider } from './projects-context'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: '◻' },
  { label: 'Projects', href: '/admin/projects', icon: '▦' },
  { label: 'Press', href: '/admin/press', icon: '▤' },
  { label: 'News', href: '/admin/news', icon: '▧' },
  { label: 'Content', href: '/admin/content', icon: '▨' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [, setUser] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  // Login page gets no shell
  if (pathname === '/admin/login') {
    return (
      <html lang="en">
        <body className="bg-[#fafafa] text-[#1a1a1a] font-sans">{children}</body>
      </html>
    )
  }

  if (loading) {
    return (
      <html lang="en">
        <body className="bg-[#fafafa] flex items-center justify-center min-h-screen">
          <div className="text-sm text-gray-400">Loading…</div>
        </body>
      </html>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <html lang="en">
      <body className="bg-[#fafafa] text-[#1a1a1a]">
        <div className="flex min-h-screen">

          {/* ── Sidebar ─────────────────────────── */}
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-200
            transform transition-transform duration-200 ease-out
            lg:translate-x-0 lg:static lg:z-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="px-5 py-5 border-b border-gray-100">
                <Link href="/admin" className="block">
                  <span className="text-lg font-semibold tracking-tight">
                    ai<span className="text-[#C75B2B]">/</span>studio
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-0.5">
                    CMS
                  </span>
                </Link>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ label, href, icon }) => {
                  const isActive = pathname === href ||
                    (href !== '/admin' && pathname.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors
                        ${isActive
                          ? 'bg-gray-100 text-[#1a1a1a] font-medium'
                          : 'text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-xs opacity-60">{icon}</span>
                      {label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="px-3 py-4 border-t border-gray-100 space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ↗ View site
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors w-full text-left"
                >
                  Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Main content ────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-[#fafafa]/95 backdrop-blur-sm border-b border-gray-200 px-4 lg:px-8 h-14 flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="text-sm text-gray-400">
                {NAV_ITEMS.find(n =>
                  pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
                )?.label || 'Admin'}
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 px-4 lg:px-8 py-6">
              <AdminProjectsProvider>
                {children}
              </AdminProjectsProvider>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
