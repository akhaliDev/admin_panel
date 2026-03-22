import { useEffect, useState, useCallback } from 'react'
import type { Order, OrderStatus } from '@/types/database'
import { getOrders, updateOrderStatus, deleteOrder } from './ordersApi'
import OrderDialog from './OrderDialog'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, Plus, Search, RefreshCw, CalendarDays } from 'lucide-react'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Ожидает',
  scheduled: 'Запланирован',
  delivered: 'Доставлен',
  not_delivered: 'Не доставлен',
}

const statusBadgeVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  scheduled: 'secondary',
  delivered: 'default',
  not_delivered: 'destructive',
}

type DateFilter = 'all' | 'today' | 'custom'

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [customDate, setCustomDate] = useState('')

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus)
      await loadOrders()
    } catch (err) {
      console.error('Ошибка смены статуса:', err)
      alert('Не удалось сменить статус')
    }
  }

  const handleDelete = async (order: Order) => {
    if (!confirm(`Удалить заказ клиента "${order.client_name}"?`)) return

    try {
      await deleteOrder(order.id)
      await loadOrders()
    } catch (err) {
      console.error('Ошибка удаления:', err)
      alert('Не удалось удалить заказ')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const today = toLocalDateString(new Date())

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchesSearch =
      o.client_name.toLowerCase().includes(q) ||
      o.client_phone.toLowerCase().includes(q) ||
      o.client_address.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (dateFilter === 'today') return o.delivery_date === today
    if (dateFilter === 'custom' && customDate) return o.delivery_date === customDate

    return true
  })

  const totalBottles = filtered.reduce((sum, o) => sum + o.quantity, 0)
  const totalAmount = filtered.reduce((sum, o) => sum + o.total_amount, 0)

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Заказы</h1>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Заказов: {filtered.length} · Бутылей: {totalBottles} · Сумма: {totalAmount} ₽
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="h-10">
          <Plus size={16} className="mr-2" />
          Новый заказ
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={dateFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setDateFilter('all'); setCustomDate('') }}
        >
          Все заказы
        </Button>
        <Button
          variant={dateFilter === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setDateFilter('today'); setCustomDate('') }}
        >
          Доставка сегодня
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant={dateFilter === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('custom')}
          >
            <CalendarDays size={14} className="mr-1" />
            Выбрать дату
          </Button>
          {dateFilter === 'custom' && (
            <Input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="h-8 w-auto"
            />
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, телефону или адресу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клиент</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Кол-во</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата доставки</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  {search ? 'Ничего не найдено' : 'Нет заказов'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.client_name}</TableCell>
                  <TableCell>{order.client_phone}</TableCell>
                  <TableCell className="max-w-50 truncate">{order.client_address}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.total_amount} ₽</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.delivery_date)}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                      >
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {Object.entries(statusLabels)
                          .filter(([key]) => key !== order.status)
                          .map(([key, label]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleStatusChange(order, key as OrderStatus)}
                            >
                              <RefreshCw size={14} className="mr-2" />
                              {label}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(order)}
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

      <OrderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadOrders}
      />
    </div>
  )
}
