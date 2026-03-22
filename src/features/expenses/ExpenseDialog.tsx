import { useState, useEffect } from 'react'
import type { Expense, ExpenseType } from '@/types/database'
import { createExpense, updateExpense } from './expensesApi'
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

interface ExpenseDialogProps {
  expense: Expense | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const typeLabels: Record<ExpenseType, string> = {
  personal: 'Личные',
  company: 'Компания',
  salary: 'Зарплата',
  unexpected: 'Непредвиденные',
}

export default function ExpenseDialog({ expense, open, onClose, onSaved }: ExpenseDialogProps) {
  const isEdit = !!expense
  const [type, setType] = useState<ExpenseType>('personal')
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (expense) {
        setType(expense.type)
        setAmount(String(expense.amount))
        setComment(expense.comment || '')
        setDate(expense.created_at.split('T')[0])
      } else {
        setType('personal')
        setAmount('')
        setComment('')
        setDate(new Date().toISOString().split('T')[0])
      }
      setError(null)
    }
  }, [expense, open])

  const canSave = !!amount && Number(amount) > 0

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      if (isEdit) {
        await updateExpense(expense.id, {
          type,
          amount: Number(amount),
          comment,
          created_at: new Date(date + 'T00:00:00').toISOString(),
        })
      } else {
        await createExpense({
          type,
          amount: Number(amount),
          comment,
          created_at: new Date(date + 'T00:00:00').toISOString(),
        })
      }
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
          <DialogTitle>{isEdit ? 'Редактировать расход' : 'Новый расход'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Тип расхода</Label>
            <Select value={type} onValueChange={(v) => setType(v as ExpenseType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">Сумма</Label>
            <Input
              id="expense-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Дата</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-comment">Комментарий</Label>
            <Input
              id="expense-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Необязательно"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
