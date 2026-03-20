import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Employee, EmployeeRole } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  employee: Employee | null
  role: EmployeeRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEmployee = async (userId: string): Promise<Employee | null> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Ошибка загрузки сотрудника:', error)
        return null
      }
      return data as Employee
    } catch (err) {
      console.error('Ошибка сети:', err)
      return null
    }
  }

  // Инициализация — один раз при загрузке
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSession(session)
          setUser(session.user)
          const emp = await fetchEmployee(session.user.id)
          setEmployee(emp)
        }
      } catch (err) {
        console.error('Ошибка инициализации:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    // Слушаем только выход и обновление токена
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setEmployee(null)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      return { error: error.message }
    }

    if (data.user) {
      setUser(data.user)
      setSession(data.session)
      const emp = await fetchEmployee(data.user.id)
      setEmployee(emp)
    }

    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setEmployee(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        employee,
        role: employee?.role ?? null,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}
