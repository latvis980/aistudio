'use client'

// app/admin/projects-context.tsx

import { createContext, useContext, useState } from 'react'
import { Project } from '@/lib/types'

interface AdminProjectsContextValue {
  projects: Project[] | null
  setProjects: (projects: Project[]) => void
}

export const AdminProjectsContext = createContext<AdminProjectsContextValue>({
  projects: null,
  setProjects: () => {},
})

export function AdminProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  return (
    <AdminProjectsContext.Provider value={{ projects, setProjects }}>
      {children}
    </AdminProjectsContext.Provider>
  )
}

export function useAdminProjects() {
  return useContext(AdminProjectsContext)
}
