import { useEffect, useState, useCallback } from 'react'
import type { Expense, ExpenseType } from '@/types/database'
import { getExpenses, deleteExpense } from './expensesApi'
import ExpenseDialog from './ExpenseDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Plus, Search, CalendarDays } from 'lucide-react'

const typeLabels: Record<ExpenseType, string> = {
  personal: 'Личные',
  company: 'Компания',
  salary: 'Зарплата',
  unexpected: 'Непредвиденные',
}

const typeBadgeVariant: Record<ExpenseType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  personal: 'outline',
  company: 'secondary',
  salary: 'default',
  unexpected: 'destructive',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isCreate, setIsCreate] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | 'range'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadExpenses = useCallback(async () => {
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (err) {
      console.error('Ошибка загрузки расходов:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const handleCreate = () => {
    setEditExpense(null)
    setIsCreate(true)
    setDialogOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense)
    setIsCreate(false)
    setDialogOpen(true)
  }

  const handleDelete = async (expense: Expense) => {
    if (!confirm('Удалить этот расход?')) return

    try {
      await deleteExpense(expense.id)
      await loadExpenses()
    } catch (err) {
      console.error('Ошибка удаления:', err)
      alert('Не удалось удалить расход')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase()
    const matchesSearch =
      typeLabels[e.type].toLowerCase().includes(q) ||
      e.comment?.toLowerCase().includes(q) ||
      String(e.amount).includes(search)

    if (!matchesSearch) return false

    if (dateFilter === 'range') {
      const d = e.created_at.split('T')[0]
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
    }

    return true
  })

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0)

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Расходы</h1>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Расходы</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {filtered.length} · Сумма: {totalAmount} ₽
          </p>
        </div>
        <Button onClick={handleCreate} className="h-10">
          <Plus size={16} className="mr-2" />
          Внести расход
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={dateFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setDateFilter('all'); setDateFrom(''); setDateTo('') }}
        >
          Все расходы
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant={dateFilter === 'range' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('range')}
          >
            <CalendarDays size={14} className="mr-1" />
            Период
          </Button>
          {dateFilter === 'range' && (
            <>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 w-auto"
                placeholder="С"
              />
              <span className="text-sm text-muted-foreground">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 w-auto"
                placeholder="По"
              />
            </>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по типу, комментарию или сумме..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Комментарий</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {search ? 'Ничего не найдено' : 'Нет расходов'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="max-w-30 truncate">
                    {expense.comment || '—'}
                  </TableCell>
                  <TableCell className="font-medium">{expense.amount} ₽</TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant[expense.type]}>
                      {typeLabels[expense.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(expense.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                      >
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(expense)}>
                          <Pencil size={14} className="mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(expense)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ExpenseDialog
        expense={isCreate ? null : editExpense}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditExpense(null)
        }}
        onSaved={loadExpenses}
      />
    </div>
  )
}
