export type PaymentMethod = 'cash' | 'card' | 'company'
export type OrderStatus = 'pending' | 'scheduled' | 'delivered' | 'not_delivered'
export type EmployeeRole = 'admin' | 'operator' | 'courier'
export type ExpenseType = 'personal' | 'company' | 'salary' | 'unexpected'

export interface Employee {
  id: string
  full_name: string
  role: EmployeeRole
  email: string
  created_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Client {
  id: string
  full_name: string
  address: string
  phone: string
  comment: string
  payment_method: PaymentMethod
  created_at: string
  last_order_at: string | null
  created_by: string | null
  updated_by: string | null
}

export interface Order {
  id: string
  client_id: string
  client_name: string
  client_phone: string
  client_address: string
  payment_method: PaymentMethod
  quantity: number
  total_amount: number
  status: OrderStatus
  comment: string
  delivery_date: string
  created_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Expense {
  id: string
  type: ExpenseType
  comment: string
  amount: number
  created_at: string
  created_by: string | null
  updated_by: string | null
}

// Типы для Supabase клиента
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'created_at' | 'created_by' | 'updated_by'> & {
          created_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'last_order_at' | 'created_by' | 'updated_by'> & {
          id?: string
          created_at?: string
          last_order_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'created_by' | 'updated_by'> & {
          id?: string
          created_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      expenses: {
        Row: Expense
        Insert: Omit<Expense, 'id' | 'created_at' | 'created_by' | 'updated_by'> & {
          id?: string
          created_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: Partial<Omit<Expense, 'id'>>
      }
    }
    Enums: {
      payment_method: PaymentMethod
      order_status: OrderStatus
      employee_role: EmployeeRole
      expense_type: ExpenseType
    }
  }
}
