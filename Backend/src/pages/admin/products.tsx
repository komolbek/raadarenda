import { useEffect, useState } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  category_id: string
  category_name: string
  photos: string[]
  daily_price: number
  total_stock: number
  is_active: boolean
  created_at: string
}

interface Category {
  id: string
  name: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    daily_price: 0,
    total_stock: 1,
    is_active: true,
    spec_width: '',
    spec_height: '',
    spec_depth: '',
    spec_weight: '',
    spec_color: '',
    spec_material: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [page, categoryFilter])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      if (json.success) {
        setCategories(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (categoryFilter) params.append('category_id', categoryFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/products?${params}`)
      const json = await res.json()
      if (json.success) {
        setProducts(json.data)
        setTotalPages(json.pagination.total_pages)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      description: '',
      category_id: categories[0]?.id || '',
      daily_price: 0,
      total_stock: 1,
      is_active: true,
      spec_width: '',
      spec_height: '',
      spec_depth: '',
      spec_weight: '',
      spec_color: '',
      spec_material: '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          category_id: form.category_id,
          daily_price: form.daily_price,
          total_stock: form.total_stock,
          is_active: form.is_active,
          specifications: {
            width: form.spec_width || null,
            height: form.spec_height || null,
            depth: form.spec_depth || null,
            weight: form.spec_weight || null,
            color: form.spec_color || null,
            material: form.spec_material || null,
          },
        }),
      })
      const json = await res.json()
      if (json.success) {
        setShowModal(false)
        fetchProducts()
      }
    } catch (err) {
      console.error('Failed to create product:', err)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' сум'
  }

  return (
    <>
      <Head>
        <title>Товары - RaadArenda Admin</title>
      </Head>
      <AdminLayout title="Товары">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Добавить товар
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Товар
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Категория
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Цена / день
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        На складе
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.photos[0] ? (
                              <img
                                src={product.photos[0]}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 mr-3" />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.category_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatPrice(product.daily_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.total_stock} шт
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.is_active ? 'Активен' : 'Неактивен'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Страница {page} из {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 my-8 p-6">
              <h3 className="text-lg font-semibold mb-4">Добавить товар</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Название *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Категория *
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({ ...form, category_id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Цена за день (сум) *
                    </label>
                    <input
                      type="number"
                      value={form.daily_price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          daily_price: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Количество на складе *
                    </label>
                    <input
                      type="number"
                      value={form.total_stock}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          total_stock: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm">
                      Активен
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Характеристики</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Ширина
                      </label>
                      <input
                        type="text"
                        value={form.spec_width}
                        onChange={(e) =>
                          setForm({ ...form, spec_width: e.target.value })
                        }
                        placeholder="например: 60 см"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Высота
                      </label>
                      <input
                        type="text"
                        value={form.spec_height}
                        onChange={(e) =>
                          setForm({ ...form, spec_height: e.target.value })
                        }
                        placeholder="например: 100 см"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Глубина
                      </label>
                      <input
                        type="text"
                        value={form.spec_depth}
                        onChange={(e) =>
                          setForm({ ...form, spec_depth: e.target.value })
                        }
                        placeholder="например: 50 см"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Вес
                      </label>
                      <input
                        type="text"
                        value={form.spec_weight}
                        onChange={(e) =>
                          setForm({ ...form, spec_weight: e.target.value })
                        }
                        placeholder="например: 5 кг"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Цвет
                      </label>
                      <input
                        type="text"
                        value={form.spec_color}
                        onChange={(e) =>
                          setForm({ ...form, spec_color: e.target.value })
                        }
                        placeholder="например: Белый"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Материал
                      </label>
                      <input
                        type="text"
                        value={form.spec_material}
                        onChange={(e) =>
                          setForm({ ...form, spec_material: e.target.value })
                        }
                        placeholder="например: Дерево"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}
