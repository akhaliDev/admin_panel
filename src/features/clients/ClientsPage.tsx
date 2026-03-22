import { useEffect, useState, useCallback } from 'react'
import type { Client, PaymentMethod } from '@/types/database'
import { getClients, deleteClient } from './clientsApi'
import ClientDialog from './ClientDialog'
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
import { MoreHorizontal, Pencil, Trash2, Plus, Search } from 'lucide-react'

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Наличные',
  card: 'Карта',
  company: 'От компании',
}

const paymentBadgeVariant: Record<PaymentMethod, 'default' | 'secondary' | 'outline'> = {
  cash: 'default',
  card: 'secondary',
  company: 'outline',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isCreate, setIsCreate] = useState(false)

  const loadClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (err) {
      console.error('Ошибка загрузки клиентов:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleCreate = () => {
    setEditClient(null)
    setIsCreate(true)
    setDialogOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditClient(client)
    setIsCreate(false)
    setDialogOpen(true)
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Удалить клиента "${client.full_name}"?`)) return

    try {
      await deleteClient(client.id)
      await loadClients()
    } catch (err) {
      console.error('Ошибка удаления:', err)
      alert('Не удалось удалить клиента')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Клиенты</h1>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Клиенты</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {clients.length}
          </p>
        </div>
        <Button onClick={handleCreate} className="h-10">
          <Plus size={16} className="mr-2" />
          Добавить клиента
        </Button>
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
              <TableHead>ФИО</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Последний заказ</TableHead>
              <TableHead>Оплата</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {search ? 'Ничего не найдено' : 'Нет клиентов'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.full_name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="max-w-40 truncate">{client.address}</TableCell>
                  <TableCell className="max-w-60 truncate text-muted-foreground whitespace-normal">
                    {client.comment || '—'}
                  </TableCell>
                  <TableCell>{formatDate(client.created_at)}</TableCell>
                  <TableCell>
                    {client.last_order_at ? formatDate(client.last_order_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentBadgeVariant[client.payment_method]}>
                      {paymentLabels[client.payment_method]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                      >
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil size={14} className="mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(client)}
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

      <ClientDialog
        client={isCreate ? null : editClient}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditClient(null)
        }}
        onSaved={loadClients}
      />
    </div>
  )
}
