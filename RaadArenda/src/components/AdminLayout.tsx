import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Home,
  ShoppingCart,
  Package,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

const navItems = [
  { href: '/admin/dashboard', label: 'Главная', icon: Home },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/categories', label: 'Категории', icon: FolderOpen },
  { href: '/admin/customers', label: 'Клиенты', icon: Users },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth')
      if (!res.ok) {
        router.push('/admin/login')
        return
      }
      setLoading(false)
    } catch (err) {
      router.push('/admin/login')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-xl font-bold text-blue-600">4Event</span>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4">
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
