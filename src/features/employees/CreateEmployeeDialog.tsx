import { useState } from 'react'
import type { EmployeeRole } from '@/types/database'
import { createEmployee } from './employeesApi'
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

interface CreateEmployeeDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateEmployeeDialog({ open, onClose, onCreated }: CreateEmployeeDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<EmployeeRole>('operator')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setRole('operator')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSave = async () => {
    if (!email || !password || !fullName) return

    setSaving(true)
    setError(null)

    try {
      await createEmployee({ email, password, full_name: fullName, role })
      resetForm()
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый сотрудник</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Имя</Label>
            <Input
              id="create-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">Пароль</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
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

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !email || !password || !fullName}
          >
            {saving ? 'Создание...' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
