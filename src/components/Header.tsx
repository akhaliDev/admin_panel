import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  operator: 'Оператор',
  courier: 'Курьер',
}

export default function Header() {
  const { employee, role, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      <div />

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium leading-none">
            {employee?.full_name || 'Пользователь'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {role ? roleLabels[role] : ''}
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={signOut} title="Выйти">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  )
}
