import { useState, useEffect } from 'react'
import type { Client, PaymentMethod } from '@/types/database'
import { createClient, updateClient, type ClientFormData } from './clientsApi'
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

interface ClientDialogProps {
  client: Client | null  // null = создание, объект = редактирование
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Наличные',
  card: 'Карта',
  company: 'Компания',
}

export default function ClientDialog({ client, open, onClose, onSaved }: ClientDialogProps) {
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!client

  useEffect(() => {
    if (client) {
      setFullName(client.full_name)
      setAddress(client.address)
      setPhone(client.phone)
      setComment(client.comment || '')
      setPaymentMethod(client.payment_method)
    } else {
      setFullName('')
      setAddress('')
      setPhone('')
      setComment('')
      setPaymentMethod('cash')
    }
    setError(null)
  }, [client, open])

  const handleSave = async () => {
    if (!fullName.trim() || !address.trim() || !phone.trim()) return
    setSaving(true)
    setError(null)

    const formData: ClientFormData = {
      full_name: fullName,
      address,
      phone,
      comment,
      payment_method: paymentMethod,
    }

    try {
      if (isEdit) {
        await updateClient(client.id, formData)
      } else {
        await createClient(formData)
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
          <DialogTitle>{isEdit ? 'Редактирование клиента' : 'Новый клиент'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">ФИО</Label>
            <Input
              id="client-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Телефон</Label>
            <Input
              id="client-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-address">Адрес</Label>
            <Input
              id="client-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Примерная, д. 1, кв. 10"
            />
          </div>

          <div className="space-y-2">
            <Label>Способ оплаты</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
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

          <div className="space-y-2">
            <Label htmlFor="client-comment">Комментарий</Label>
            <Input
              id="client-comment"
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
          <Button
            onClick={handleSave}
            disabled={saving || !fullName.trim() || !address.trim() || !phone.trim()}
          >
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
