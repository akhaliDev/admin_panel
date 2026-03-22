import { useState, useEffect, useRef } from 'react'
import type { Client, PaymentMethod } from '@/types/database'
import { getClients } from '@/features/clients/clientsApi'
import { createOrder, createOrderWithNewClient } from './ordersApi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { Search, X } from 'lucide-react'

interface OrderDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Наличные',
  card: 'Карта',
  company: 'Компания',
}

export default function OrderDialog({ open, onClose, onSaved }: OrderDialogProps) {
  const [tab, setTab] = useState<string>('existing')
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Existing client
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // New client fields
  const [newFullName, setNewFullName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('cash')

  // Order fields
  const [quantity, setQuantity] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (open) {
      getClients().then(setClients).catch(console.error)
      resetForm()
    }
  }, [open])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredClients = clientSearch.length >= 3
    ? clients.filter((c) => {
        const q = clientSearch.toLowerCase()
        return c.full_name.toLowerCase().includes(q) || c.phone.includes(clientSearch)
      })
    : []

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id)
    setSelectedClient(client)
    setClientSearch(`${client.full_name} (${client.phone})`)
    setClientDropdownOpen(false)
  }

  const handleClearClient = () => {
    setSelectedClientId('')
    setSelectedClient(null)
    setClientSearch('')
  }

  const resetForm = () => {
    setTab('existing')
    setSelectedClientId('')
    setSelectedClient(null)
    setClientSearch('')
    setClientDropdownOpen(false)
    setNewFullName('')
    setNewPhone('')
    setNewAddress('')
    setNewPaymentMethod('cash')
    setQuantity('')
    setTotalAmount('')
    setDeliveryDate('')
    setComment('')
    setError(null)
  }

  const isExistingValid = !!selectedClientId && !!quantity && !!totalAmount && !!deliveryDate
  const isNewValid =
    !!newFullName.trim() &&
    !!newPhone.trim() &&
    !!newAddress.trim() &&
    !!quantity &&
    !!totalAmount &&
    !!deliveryDate

  const canSave = tab === 'existing' ? isExistingValid : isNewValid

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      if (tab === 'existing' && selectedClient) {
        await createOrder({
          client_id: selectedClient.id,
          client_name: selectedClient.full_name,
          client_phone: selectedClient.phone,
          client_address: selectedClient.address,
          payment_method: selectedClient.payment_method,
          quantity: Number(quantity),
          total_amount: Number(totalAmount),
          delivery_date: deliveryDate,
          comment,
        })
      } else {
        await createOrderWithNewClient(
          {
            full_name: newFullName,
            phone: newPhone,
            address: newAddress,
            payment_method: newPaymentMethod,
          },
          {
            quantity: Number(quantity),
            total_amount: Number(totalAmount),
            delivery_date: deliveryDate,
            comment,
          }
        )
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания заказа')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый заказ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs defaultValue="existing" value={tab} onValueChange={(v) => setTab(v as string)}>
            <TabsList className="w-full">
              <TabsTrigger value="existing" className="flex-1">Существующий клиент</TabsTrigger>
              <TabsTrigger value="new" className="flex-1">Новый клиент</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Клиент</Label>
                <div ref={searchWrapperRef} className="relative">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value)
                        setClientDropdownOpen(true)
                        if (!e.target.value) handleClearClient()
                      }}
                      onFocus={() => clientSearch.length >= 3 && setClientDropdownOpen(true)}
                      placeholder="Введите имя или телефон (мин. 3 символа)"
                      className="pl-9 pr-9"
                    />
                    {selectedClientId && (
                      <button
                        type="button"
                        onClick={handleClearClient}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {clientDropdownOpen && filteredClients.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-48 overflow-y-auto">
                      {filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectClient(c)}
                          className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          {c.full_name} ({c.phone})
                        </button>
                      ))}
                    </div>
                  )}

                  {clientDropdownOpen && clientSearch.length >= 3 && filteredClients.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                      <p className="text-sm text-muted-foreground text-center">Клиент не найден</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedClient && (
                <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/50">
                  <p><span className="text-muted-foreground">Адрес:</span> {selectedClient.address}</p>
                  <p><span className="text-muted-foreground">Оплата:</span> {paymentLabels[selectedClient.payment_method]}</p>
                  {selectedClient.comment && (
                    <p><span className="text-muted-foreground">Комментарий:</span> {selectedClient.comment}</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">ФИО</Label>
                <Input
                  id="new-name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-phone">Телефон</Label>
                <Input
                  id="new-phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-address">Адрес</Label>
                <Input
                  id="new-address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="ул. Примерная, д. 1, кв. 10"
                />
              </div>
              <div className="space-y-2">
                <Label>Способ оплаты</Label>
                <Select value={newPaymentMethod} onValueChange={(v) => setNewPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-qty">Кол-во бутылей</Label>
                <Input
                  id="order-qty"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-amount">Сумма</Label>
                <Input
                  id="order-amount"
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-date">Дата доставки</Label>
              <Input
                id="order-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-comment">Комментарий</Label>
              <Input
                id="order-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Необязательно"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? 'Создание...' : 'Создать заказ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
