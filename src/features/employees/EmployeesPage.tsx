import { useEffect, useState, useCallback } from 'react'
import type { Employee } from '@/types/database'
import { getEmployees, deleteEmployee } from './employeesApi'
import EmployeeDialog from './EmployeeDialog'
import CreateEmployeeDialog from './CreateEmployeeDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  operator: 'Оператор',
  courier: 'Курьер',
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  operator: 'secondary',
  courier: 'outline',
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const loadEmployees = useCallback(async () => {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee)
    setDialogOpen(true)
  }

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Удалить сотрудника "${employee.full_name}"?`)) return

    try {
      await deleteEmployee(employee.id)
      await loadEmployees()
    } catch (err) {
      console.error('Ошибка удаления:', err)
      alert('Не удалось удалить сотрудника')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Сотрудники</h1>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Сотрудники</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {employees.length}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="h-10">
          <Plus size={16} className="mr-2" />
          Добавить сотрудника
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Нет сотрудников
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.full_name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[emp.role]}>
                      {roleLabels[emp.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(emp.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(emp)}>
                          <Pencil size={14} className="mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(emp)}
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

      <CreateEmployeeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={loadEmployees}
      />

      <EmployeeDialog
        employee={editEmployee}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditEmployee(null)
        }}
        onSaved={loadEmployees}
      />
    </div>
  )
}
