import { useState, useEffect } from 'react'
import type { Employee, EmployeeRole } from '@/types/database'
import { updateEmployee } from './employeesApi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EmployeeDialogProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function EmployeeDialog({ employee, open, onClose, onSaved }: EmployeeDialogProps) {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<EmployeeRole>('operator')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employee) {
      setFullName(employee.full_name)
      setRole(employee.role)
      setPassword('')
    }
  }, [employee])

  const handleSave = async () => {
    if (!employee) return
    setSaving(true)
    setError(null)

    try {
      const updates: { full_name: string; role: EmployeeRole; password?: string } = {
        full_name: fullName,
        role,
      }
      if (password.trim()) {
        updates.password = password
      }
      await updateEmployee(employee.id, updates)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование сотрудника</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={employee?.email ?? ''} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Имя</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Роль</Label>
            <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="operator">Оператор</SelectItem>
                <SelectItem value="courier">Курьер</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Новый пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Оставьте пустым, если не менять"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !fullName.trim()}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
