import { supabase } from '@/lib/supabase'
import type { Employee, EmployeeRole } from '@/types/database'

export interface CreateEmployeeData {
  email: string
  password: string
  full_name: string
  role: EmployeeRole
}

export async function createEmployee(data: CreateEmployeeData): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-employee`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(data),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Ошибка создания сотрудника')
  }
}

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Employee[]
}

export async function updateEmployee(
  id: string,
  updates: { full_name?: string; role?: EmployeeRole; password?: string }
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-employee`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ user_id: id, ...updates }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Ошибка обновления сотрудника')
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-employee`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ user_id: id }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Ошибка удаления сотрудника')
  }
}
