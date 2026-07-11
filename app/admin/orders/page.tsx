'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { formatDZD, formatDate } from '@/lib/format';

export default function AdminOrdersPage() {
  const orders = useStore((state) => state.orders);
  const updateOrder = useStore((state) => state.updateOrder);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);

    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['pending', 'processing', 'shipped', 'delivered'] as const;
  const selectedOrderData = orders.find((o) => o.id === selectedOrder);

  const handleStatusChange = (orderId: string, newStatus: (typeof statuses)[number]) => {
    updateOrder(orderId, newStatus);
  };

  return (
    <AdminPageShell
      title="Orders"
      subtitle="Manage and track customer orders — cash on delivery."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Search by order ID, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-sm bg-card text-foreground placeholder-muted-foreground"
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-4 py-2 rounded-sm font-bold whitespace-nowrap text-sm transition-all ${
                  statusFilter === ''
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                All
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-sm font-bold whitespace-nowrap text-sm capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-sm p-12 text-center">
                <p className="text-muted-foreground text-sm">
                  {searchTerm || statusFilter ? 'No orders match your filters' : 'No orders yet'}
                </p>
              </div>
            ) : (
              [...filteredOrders]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() =>
                      setSelectedOrder(selectedOrder === order.id ? null : order.id)
                    }
                    className={`bg-card border cursor-pointer transition-all p-4 rounded-sm ${
                      selectedOrder === order.id
                        ? 'border-primary'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-foreground font-mono text-sm">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className="text-lg font-black text-primary">{formatDZD(order.total)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.wilaya}
                        </p>
                      </div>
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, e.target.value as (typeof statuses)[number]);
                        }}
                        className="text-xs font-bold px-2 py-1 rounded-sm border border-border bg-background capitalize shrink-0"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>

        {selectedOrderData && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-sm p-5 h-fit lg:sticky lg:top-24"
          >
            <h2 className="font-black text-foreground mb-5">Order Details</h2>

            <div className="mb-5 pb-5 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Customer
              </h3>
              <p className="font-bold text-sm">{selectedOrderData.customerName}</p>
              <p className="text-sm text-muted-foreground">
                {selectedOrderData.customerPhone}
              </p>
              {selectedOrderData.customerEmail && (
                <p className="text-sm text-muted-foreground">{selectedOrderData.customerEmail}</p>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Delivery
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedOrderData.commune}, {selectedOrderData.wilaya}
              </p>
              {selectedOrderData.address && (
                <p className="text-sm text-muted-foreground mt-1">{selectedOrderData.address}</p>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-border space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Items
              </h3>
              {selectedOrderData.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="font-semibold truncate mr-2">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="font-mono shrink-0">
                    {formatDZD(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <p className="flex justify-between font-black mb-5">
              <span>Total (COD)</span>
              <span className="text-primary">{formatDZD(selectedOrderData.total)}</span>
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-primary text-primary-foreground py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Print Invoice
              </button>
              <button
                type="button"
                className="w-full border border-border py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2 hover:bg-muted"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AdminPageShell>
  );
}
