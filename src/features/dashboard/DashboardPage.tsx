import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { employee, role, signOut } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Админ-панель доставки воды</h1>
      <p className="text-muted-foreground">
        {employee?.full_name} — <span className="font-medium">{role}</span>
      </p>
      <Button variant="outline" onClick={signOut}>
        Выйти
      </Button>
    </div>
  )
}
