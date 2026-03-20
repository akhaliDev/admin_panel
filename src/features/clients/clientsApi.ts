import { supabase } from '@/lib/supabase'
import type { Client, PaymentMethod } from '@/types/database'

export interface ClientFormData {
  full_name: string
  address: string
  phone: string
  comment?: string
  payment_method: PaymentMethod
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Client[]
}

export async function createClient(client: ClientFormData): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function updateClient(id: string, updates: Partial<ClientFormData>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}
