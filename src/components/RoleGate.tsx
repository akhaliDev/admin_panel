import type { ReactNode } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import type { EmployeeRole } from '@/types/database'

interface RoleGateProps {
  allowedRoles: EmployeeRole[]
  children: ReactNode
  fallback?: ReactNode
}

export default function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role } = useAuth()

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
