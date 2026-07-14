'use client';

import { useState, useEffect } from 'react';
import { useStore, Product } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useRef } from 'react';
import { COLLECTIONS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  oldPrice: 0,
  image: '',
  category: COLLECTIONS[0].id,
  stock: 0,
  sizes: [] as string[],
  colors: [] as string[],
  rating: 0,
};

export default function AdminProductsPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const products = useStore((state) => state.products);
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
      setEditingId(null);
    } else {
      addProduct({
        id: `prod-${Date.now()}`,
        ...formData,
      });
    }
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || 0,
      image: product.image,
      category: product.category,
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      rating: product.rating || 0,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  if (!hydrated) {
    return (
      <AdminPageShell title="المنتجات" subtitle="إدارة كتالوجك — الأسعار بالدينار الجزائري.">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="animate-pulse">جارٍ التحميل...</div>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="المنتجات"
      subtitle="إدارة كتالوجك — الأسعار بالدينار الجزائري."
      actions={
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData(emptyForm);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm font-bold text-sm hover:bg-redDim transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      }
    >
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-sm p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black">{editingId ? 'تعديل المنتج' : 'منتج جديد'}</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="p-2 hover:bg-muted rounded-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="اسم المنتج"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 border border-border rounded-sm bg-background"
              >
                {COLLECTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="الوصف"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-sm bg-background"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="السعر (د.ج)"
                value={formData.price || ''}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                required
                min={0}
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
              <input
                type="number"
                placeholder="السعر القديم (اختياري)"
                value={formData.oldPrice || ''}
                onChange={(e) =>
                  setFormData({ ...formData, oldPrice: parseFloat(e.target.value) || 0 })
                }
                min={0}
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
              <input
                type="number"
                placeholder="التقييم (0-5)"
                value={formData.rating || ''}
                onChange={(e) =>
                  setFormData({ ...formData, rating: Math.min(5, parseFloat(e.target.value) || 0) })
                }
                min={0}
                max={5}
                step={0.1}
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
              <input
                type="number"
                placeholder="المخزون"
                value={formData.stock || ''}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                }
                required
                min={0}
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted-foreground">صورة المنتج</label>
                {formData.image ? (
                  <div className="relative group">
                    <img
                      src={formData.image}
                      alt="معاينة"
                      className="w-full h-32 object-cover border border-border rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-1 left-1 p-1 bg-destructive text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors text-muted-foreground"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-bold">إلغاء تحميل الصورة</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">المقاسات المتاحة</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.sizes.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-sm text-xs font-bold">
                      {s}
                      <button type="button" onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((x) => x !== s) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && sizeInput.trim()) {
                        e.preventDefault();
                        if (!formData.sizes.includes(sizeInput.trim())) {
                          setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
                        }
                        setSizeInput('');
                      }
                    }}
                    placeholder="أضف مقاس ثم اضغط Enter"
                    className="flex-1 px-3 py-1.5 border border-border rounded-sm bg-background text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">الألوان المتاحة</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.colors.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-sm text-xs font-bold">
                      {c}
                      <button type="button" onClick={() => setFormData({ ...formData, colors: formData.colors.filter((x) => x !== c) })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && colorInput.trim()) {
                        e.preventDefault();
                        if (!formData.colors.includes(colorInput.trim())) {
                          setFormData({ ...formData, colors: [...formData.colors, colorInput.trim()] });
                        }
                        setColorInput('');
                      }
                    }}
                    placeholder="أضف لون ثم اضغط Enter"
                    className="flex-1 px-3 py-1.5 border border-border rounded-sm bg-background text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-2.5 font-bold rounded-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'حفظ التغييرات' : 'إضافة منتج'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-border py-2.5 font-bold rounded-sm hover:bg-muted"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <input
        type="text"
        placeholder="البحث عن منتجات..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2.5 border border-border rounded-sm bg-card mb-6"
      />

      <div className="overflow-x-auto bg-card border border-border rounded-sm">
        {filteredProducts.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">
            {searchTerm ? 'لا توجد منتجات مطابقة' : 'لا توجد منتجات بعد — أضف منتجك الأول.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4 font-bold">الاسم</th>
                <th className="text-left p-4 font-bold">المجموعة</th>
                <th className="text-left p-4 font-bold">السعر</th>
                <th className="text-left p-4 font-bold">المخزون</th>
                <th className="text-left p-4 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/40">
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-sm">
                      {COLLECTIONS.find((col) => col.id === product.category)?.icon}{' '}
                      {COLLECTIONS.find((col) => col.id === product.category)?.name || product.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-primary">
                    {formatDZD(product.price)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold ${
                        product.stock > 10
                          ? 'text-foreground'
                          : product.stock > 0
                            ? 'text-venom'
                            : 'text-destructive'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === product.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            deleteProduct(product.id);
                            setDeleteConfirm(null);
                          }}
                          className="px-2 py-1 text-xs font-bold bg-destructive text-white rounded-sm"
                        >
                          تأكيد
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
