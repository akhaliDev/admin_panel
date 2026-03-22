import { supabase } from '@/lib/supabase'
import type { Expense, ExpenseType } from '@/types/database'

export interface ExpenseFormData {
  type: ExpenseType
  amount: number
  comment?: string
  created_at?: string
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Expense[]
}

export async function createExpense(expense: ExpenseFormData): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, updates: Partial<ExpenseFormData>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}
