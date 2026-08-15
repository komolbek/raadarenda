'use client';

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, GripVertical, Upload, X, Layers } from 'lucide-react'
import { Modal, btn } from '@/components/Modal'
import { adminSetsApi, adminProductsApi, adminUploadApi } from '@/lib/api'

interface SetItem {
  id?: string
  product_id: string
  quantity: number
  product?: { id: string; name: string; daily_price: number; photos: string[] }
}
interface SetRow {
  id: string
  name: string
  name_uz: string | null
  name_en: string | null
  description: string | null
  description_uz: string | null
  description_en: string | null
  photos: string[]
  is_active: boolean
  daily_price: number
  items_count: number
  items: SetItem[]
}
interface ProductOpt {
  id: string
  name: string
  daily_price: number
  photos: string[]
}

const emptyForm = {
  name: '', name_uz: '', name_en: '',
  description: '', description_uz: '', description_en: '',
  image_url: '', is_active: true,
  items: [] as { product_id: string; quantity: number; name: string }[],
}

function fmtPrice(n: number) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('ru-RU').format(n) + ' сум'
}

export default function SetsPage() {
  const [sets, setSets] = useState<SetRow[]>([])
  const [products, setProducts] = useState<ProductOpt[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SetRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [addProductId, setAddProductId] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<SetRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchSets()
    fetchProducts()
  }, [])

  const fetchSets = async () => {
    setLoading(true)
    try {
      const { data } = await adminSetsApi.list()
      if (data.success) setSets(data.data.items || data.data || [])
    } catch (err) {
      console.error('Failed to fetch sets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data } = await adminProductsApi.list({ limit: 300 })
      if (data.success) setProducts(data.data.items || data.data || [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setAddProductId('')
    setError(null)
    setShowModal(true)
  }

  const openEdit = (s: SetRow) => {
    setEditing(s)
    setForm({
      name: s.name,
      name_uz: s.name_uz || '',
      name_en: s.name_en || '',
      description: s.description || '',
      description_uz: s.description_uz || '',
      description_en: s.description_en || '',
      image_url: s.photos?.[0] || '',
      is_active: s.is_active,
      items: (s.items || []).map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        name: it.product?.name || products.find((p) => p.id === it.product_id)?.name || it.product_id,
      })),
    })
    setAddProductId('')
    setError(null)
    setShowModal(true)
  }

  const addItem = () => {
    if (!addProductId) return
    if (form.items.some((i) => i.product_id === addProductId)) return
    const p = products.find((pr) => pr.id === addProductId)
    setForm((f) => ({
      ...f,
      items: [...f.items, { product_id: addProductId, quantity: 1, name: p?.name || addProductId }],
    }))
    setAddProductId('')
  }

  const setItemQty = (pid: string, qty: number) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.product_id === pid ? { ...i, quantity: Math.max(1, qty) } : i)),
    }))

  const removeItem = (pid: string) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.product_id !== pid) }))

  const handleImageUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await adminUploadApi.uploadImage(file)
      if (data.success && data.data?.url) setForm((f) => ({ ...f, image_url: data.data.url }))
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
      ev.target.value = ''
    }
  }

  const estPrice = form.items.reduce((sum, it) => {
    const p = products.find((pr) => pr.id === it.product_id)
    return sum + (p?.daily_price || 0) * it.quantity
  }, 0)

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (form.items.length === 0) {
      setError('Добавьте хотя бы один товар в сет')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: form.name,
        name_uz: form.name_uz || null,
        name_en: form.name_en || null,
        description: form.description || null,
        description_uz: form.description_uz || null,
        description_en: form.description_en || null,
        photos: form.image_url ? [form.image_url] : [],
        is_active: form.is_active,
        items: form.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      }
      const { data } = editing
        ? await adminSetsApi.update(editing.id, body)
        : await adminSetsApi.create(body)
      if (data.success) {
        setShowModal(false)
        fetchSets()
      } else {
        setError(data.message || 'Ошибка при сохранении')
      }
    } catch (err) {
      console.error('Failed to save set:', err)
      setError('Ошибка сети. Проверьте подключение.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      const { data } = await adminSetsApi.delete(deleteConfirm.id)
      if (data.success) {
        setDeleteConfirm(null)
        fetchSets()
      }
    } catch (err) {
      console.error('Failed to delete set:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReorderDrop = async (targetIndex: number) => {
    const from = dragIndex
    setDragIndex(null)
    setDragOverIndex(null)
    if (from === null || from === targetIndex) return
    const reordered = [...sets]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(targetIndex, 0, moved)
    setSets(reordered)
    try {
      await adminSetsApi.reorder({ orderedIds: reordered.map((s) => s.id) })
    } catch (err) {
      console.error('Failed to reorder sets:', err)
      fetchSets()
    }
  }

  const field = 'w-full px-4 py-2 border border-gray-300 rounded-lg bg-white'
  const availableProducts = products.filter((p) => !form.items.some((i) => i.product_id === p.id))

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Сеты</h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Готовые комплекты товаров (например, стол + стулья)</p>
        <button onClick={openCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5 mr-2" />
          Добавить сет
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
        ) : sets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Нет сетов. Создайте первый комплект.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10" />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сет</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товаров</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена/день</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sets.map((s, index) => (
                <tr
                  key={s.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(ev) => { ev.preventDefault(); if (dragOverIndex !== index) setDragOverIndex(index) }}
                  onDrop={() => handleReorderDrop(index)}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                  className={`hover:bg-gray-50 ${dragIndex === index ? 'opacity-40' : ''} ${dragOverIndex === index && dragIndex !== null && dragIndex !== index ? 'border-t-2 border-blue-500' : ''}`}
                >
                  <td className="px-2"><GripVertical className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {s.photos?.[0] ? (
                        <img src={s.photos[0]} alt={s.name} className="h-12 w-16 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-16 rounded bg-indigo-50 flex items-center justify-center"><Layers className="h-5 w-5 text-indigo-400" /></div>
                      )}
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.items_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{fmtPrice(s.daily_price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-sm ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.is_active ? 'Активен' : 'Скрыт'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEdit(s)} aria-label="Редактировать" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"><Edit className="h-5 w-5" /></button>
                      <button type="button" onClick={() => setDeleteConfirm(s)} aria-label="Удалить" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / edit modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Редактировать сет' : 'Новый сет'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setShowModal(false)} disabled={saving} className={btn.secondary}>Отмена</button>
            <button type="submit" form="set-form" disabled={saving} className={btn.primary}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
          </>
        }
      >
        <form id="set-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название (RU) *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-gray-600 mb-1">Название (UZ)</label><input type="text" value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} className={field} /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Название (EN)</label><input type="text" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className={field} /></div>
            </div>
            <div><label className="block text-sm text-gray-600 mb-1">Описание (RU)</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={field} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-gray-600 mb-1">Описание (UZ)</label><textarea rows={2} value={form.description_uz} onChange={(e) => setForm({ ...form, description_uz: e.target.value })} className={field} /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Описание (EN)</label><textarea rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className={field} /></div>
            </div>
          </div>

          {/* Products in the set */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Товары в сете *</label>
            <div className="flex gap-2 mb-3">
              <select value={addProductId} onChange={(e) => setAddProductId(e.target.value)} className={field}>
                <option value="">Выберите товар для добавления…</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {fmtPrice(p.daily_price)}</option>
                ))}
              </select>
              <button type="button" onClick={addItem} disabled={!addProductId} className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50">Добавить</button>
            </div>
            {form.items.length === 0 ? (
              <p className="text-sm text-gray-400">Пока нет товаров.</p>
            ) : (
              <div className="space-y-2">
                {form.items.map((it) => (
                  <div key={it.product_id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                    <span className="flex-1 text-sm font-medium">{it.name}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-gray-500">кол-во</span>
                      <input type="number" min={1} value={it.quantity} onChange={(e) => setItemQty(it.product_id, parseInt(e.target.value, 10) || 1)} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                    </div>
                    <button type="button" onClick={() => removeItem(it.product_id)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <div className="text-right text-sm text-gray-600">Цена сета в день: <strong>{fmtPrice(estPrice)}</strong></div>
              </div>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Изображение</label>
            <div className="flex items-center gap-3">
              {form.image_url ? (
                <div className="relative">
                  <img src={form.image_url} alt="" className="h-16 w-24 rounded-lg object-cover border" />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, image_url: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="h-3 w-3" /></button>
                </div>
              ) : null}
              <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" /> : <Upload className="h-4 w-4" />}
                Загрузить фото
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="set_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 text-blue-600 rounded" />
            <label htmlFor="set_active" className="ml-2 text-sm">Активен (показывать на сайте)</label>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Удалить сет?"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setDeleteConfirm(null)} disabled={isDeleting} className={btn.secondary}>Отмена</button>
            <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className={btn.danger}>{isDeleting ? 'Удаление...' : 'Удалить'}</button>
          </>
        }
      >
        {deleteConfirm && <p className="text-gray-600">Вы уверены, что хотите удалить <strong>&quot;{deleteConfirm.name}&quot;</strong>?</p>}
      </Modal>
    </>
  )
}
