import { useEffect, useState } from 'react'
import Head from 'next/head'
import AdminLayout from '@/components/AdminLayout'
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Upload, X, AlertTriangle } from 'lucide-react'

interface Specification {
  width: string | null
  height: string | null
  depth: string | null
  weight: string | null
  color: string | null
  material: string | null
}

interface Product {
  id: string
  name: string
  description: string | null
  category_id: string
  category_name: string
  photos: string[]
  specifications: Specification
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

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
    setPhotos([])
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      daily_price: product.daily_price,
      total_stock: product.total_stock,
      is_active: product.is_active,
      spec_width: product.specifications?.width || '',
      spec_height: product.specifications?.height || '',
      spec_depth: product.specifications?.depth || '',
      spec_weight: product.specifications?.weight || '',
      spec_color: product.specifications?.color || '',
      spec_material: product.specifications?.material || '',
    })
    setPhotos(product.photos || [])
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check limit
    if (photos.length + files.length > 3) {
      alert('Максимум 3 фото')
      return
    }

    setUploadingImages(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i])
      }
      formData.append('folder', 'raadarenda/products')

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (json.success) {
        const newPhotos = Array.isArray(json.data)
          ? json.data.map((d: { url: string }) => d.url)
          : [json.data.url]
        setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3))
      }
    } catch (err) {
      console.error('Failed to upload images:', err)
    } finally {
      setUploadingImages(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          category_id: form.category_id,
          photos: photos,
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
        setEditingProduct(null)
        fetchProducts()
      }
    } catch (err) {
      console.error('Failed to save product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setDeleteConfirm(null)
        fetchProducts()
      }
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }

  const toggleProductStatus = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !product.is_active,
        }),
      })
      const json = await res.json()
      if (json.success) {
        fetchProducts()
      }
    } catch (err) {
      console.error('Failed to toggle product status:', err)
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
                          <button
                            onClick={() => toggleProductStatus(product)}
                            className={`px-2 py-1 rounded text-sm ${
                              product.is_active
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {product.is_active ? 'Активен' : 'Неактивен'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Редактировать"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Удалить"
                            >
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

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 my-8 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h3>

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

                  {/* Photos Upload */}
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Фотографии (макс. 3)
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {photos.length < 3 && (
                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50">
                          {uploadingImages ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-400 mt-1">Добавить</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImages}
                          />
                        </label>
                      )}
                    </div>
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
                    onClick={() => {
                      setShowModal(false)
                      setEditingProduct(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (() => {
          const product = products.find((p) => p.id === deleteConfirm)
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Удалить товар?</h3>
                    {product && (
                      <p className="text-sm text-gray-500">{product.name}</p>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    Вы уверены, что хотите удалить этот товар?
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">
                      <strong>Примечание:</strong> Если у товара есть история заказов, он будет деактивирован вместо полного удаления.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </AdminLayout>
    </>
  )
}
