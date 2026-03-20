import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import type { EmployeeRole } from '@/types/database'

interface ProtectedRouteProps {
  allowedRoles?: EmployeeRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Если указаны допустимые роли — проверяем доступ
  if (allowedRoles) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
