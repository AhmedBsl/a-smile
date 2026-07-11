'use client';

import { useState } from 'react';
import { useStore, Product } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { COLLECTIONS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  image: '',
  category: COLLECTIONS[0],
  stock: 0,
};

export default function AdminProductsPage() {
  const products = useStore((state) => state.products);
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
        size: 'M',
        color: 'Black',
      });
    }
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <AdminPageShell
      title="Products"
      subtitle="Manage your catalog — prices in DZD."
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
          Add Product
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
            <h2 className="font-black">{editingId ? 'Edit Product' : 'New Product'}</h2>
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
                placeholder="Product name"
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
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-sm bg-background"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Price (DZD)"
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
                placeholder="Stock"
                value={formData.stock || ''}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                }
                required
                min={0}
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
              <input
                type="url"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                className="px-4 py-2 border border-border rounded-sm bg-background"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-2.5 font-bold rounded-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Save Changes' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-border py-2.5 font-bold rounded-sm hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2.5 border border-border rounded-sm bg-card mb-6"
      />

      <div className="overflow-x-auto bg-card border border-border rounded-sm">
        {filteredProducts.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">
            {searchTerm ? 'No products found' : 'No products yet — add your first piece.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4 font-bold">Name</th>
                <th className="text-left p-4 font-bold">Collection</th>
                <th className="text-left p-4 font-bold">Price</th>
                <th className="text-left p-4 font-bold">Stock</th>
                <th className="text-left p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/40">
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-sm">
                      {product.category}
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
                          Confirm
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
