import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus, PaymentMethod } from '@/types/database'
import { createClient, type ClientFormData } from '@/features/clients/clientsApi'

export interface OrderFormData {
  client_id: string
  client_name: string
  client_phone: string
  client_address: string
  payment_method: PaymentMethod
  quantity: number
  total_amount: number
  delivery_date: string
  comment?: string
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}

export async function createOrder(order: OrderFormData): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, status: 'pending' as OrderStatus })
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function createOrderWithNewClient(
  clientData: ClientFormData,
  orderData: Omit<OrderFormData, 'client_id' | 'client_name' | 'client_phone' | 'client_address' | 'payment_method'>
): Promise<Order> {
  const client = await createClient(clientData)

  return createOrder({
    client_id: client.id,
    client_name: client.full_name,
    client_phone: client.phone,
    client_address: client.address,
    payment_method: client.payment_method,
    ...orderData,
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) throw error
}
