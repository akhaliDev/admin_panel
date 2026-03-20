import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import ProtectedRoute from '@/auth/ProtectedRoute'
import LoginPage from '@/auth/LoginPage'
import Layout from '@/components/Layout'
import { Toaster } from '@/components/ui/sonner'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ClientsPage from '@/features/clients/ClientsPage'
import OrdersPage from '@/features/orders/OrdersPage'
import EmployeesPage from '@/features/employees/EmployeesPage'
import ExpensesPage from '@/features/expenses/ExpensesPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Защищённые маршруты внутри Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />

              {/* admin + operator */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'operator']} />}>
                <Route path="/clients" element={<ClientsPage />} />
              </Route>

              {/* admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
