'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { FileText, Download, Truck, Package, Search, ExternalLink } from 'lucide-react';
import { formatDZD, formatDate } from '@/lib/format';
import { CARRIERS, CarrierSlug } from '@/lib/delivery/carriers';

export default function AdminOrdersPage() {
  const orders = useStore((state) => state.orders);
  const updateOrder = useStore((state) => state.updateOrder);
  const setOrderCarrier = useStore((state) => state.setOrderCarrier);
  const carrierCredentials = useStore((s) => s.carrierCredentials);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showShipmentForm, setShowShipmentForm] = useState<string | null>(null);
  const [shipmentCarrier, setShipmentCarrier] = useState<CarrierSlug | ''>('');
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [shipmentResult, setShipmentResult] = useState<{ ok: boolean; message: string; trackingNumber?: string } | null>(null);

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

  const activeCarriers = CARRIERS.filter((c) =>
    carrierCredentials.some((cred) => cred.carrier === c.slug && cred.enabled)
  );

  const handleCreateShipment = async (orderId: string) => {
    if (!shipmentCarrier) return;
    setCreatingShipment(true);
    setShipmentResult(null);

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      setCreatingShipment(false);
      return;
    }

    const creds = carrierCredentials.find((c) => c.carrier === shipmentCarrier);
    if (!creds) {
      setShipmentResult({ ok: false, message: 'No credentials found for this carrier' });
      setCreatingShipment(false);
      return;
    }

    try {
      const res = await fetch(`/api/delivery/${shipmentCarrier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...creds.credentials,
          shipment: {
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            wilaya: order.wilaya,
            commune: order.commune,
            address: order.address || '',
            notes: order.notes,
            items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            codAmount: order.total,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrderCarrier(orderId, shipmentCarrier, data.trackingNumber || 'PENDING');
        setShipmentResult({ ok: true, message: 'Shipment created!', trackingNumber: data.trackingNumber });
        setShowShipmentForm(null);
      } else {
        setShipmentResult({ ok: false, message: data.error || 'Failed to create shipment' });
      }
    } catch {
      setShipmentResult({ ok: false, message: 'Network error — could not reach carrier API' });
    } finally {
      setCreatingShipment(false);
    }
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
                .map((order) => {
                  const carrier = order.carrier ? CARRIERS.find((c) => c.slug === order.carrier) : null;
                  return (
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
                          {carrier && (
                            <p className="text-xs text-primary mt-0.5">
                              {carrier.logo} {carrier.name}
                              {order.trackingNumber && (
                                <span className="text-muted-foreground ml-1 font-mono">
                                  #{order.trackingNumber}
                                </span>
                              )}
                            </p>
                          )}
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
                  );
                })
            )}
          </div>
        </div>

        {/* Order Detail Sidebar */}
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
              <p className="text-sm text-muted-foreground">{selectedOrderData.customerPhone}</p>
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
              {selectedOrderData.carrier && (
                <div className="mt-2 p-2 bg-primary/5 rounded-sm">
                  <p className="text-xs font-bold text-primary">
                    {CARRIERS.find((c) => c.slug === selectedOrderData.carrier)?.logo}{' '}
                    {CARRIERS.find((c) => c.slug === selectedOrderData.carrier)?.name}
                  </p>
                  {selectedOrderData.trackingNumber && (
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      Tracking: {selectedOrderData.trackingNumber}
                    </p>
                  )}
                  {selectedOrderData.shippingCost && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Shipping: {formatDZD(selectedOrderData.shippingCost)}
                    </p>
                  )}
                </div>
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
                  <span className="font-mono shrink-0">{formatDZD(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <p className="flex justify-between font-black mb-5">
              <span>Total (COD)</span>
              <span className="text-primary">{formatDZD(selectedOrderData.total)}</span>
            </p>

            <div className="space-y-2">
              {/* Create Shipment Button (if no carrier assigned) */}
              {!selectedOrderData.carrier && selectedOrderData.status !== 'delivered' && (
                <div className="mb-3">
                  {showShipmentForm === selectedOrderData.id ? (
                    <div className="space-y-2 p-3 bg-muted/30 border border-border rounded-sm">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Carrier
                      </label>
                      <select
                        value={shipmentCarrier}
                        onChange={(e) => setShipmentCarrier(e.target.value as CarrierSlug)}
                        className="w-full px-3 py-2 border border-border rounded-sm bg-background text-sm"
                      >
                        <option value="">Choose carrier...</option>
                        {activeCarriers.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.logo} {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateShipment(selectedOrderData.id)}
                          disabled={!shipmentCarrier || creatingShipment}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-venom text-charcoal py-2 font-bold rounded-sm text-xs disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          {creatingShipment ? 'Creating...' : 'Create Shipment'}
                        </button>
                        <button
                          onClick={() => { setShowShipmentForm(null); setShipmentResult(null); }}
                          className="px-3 py-2 border border-border rounded-sm text-xs font-bold hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                      {shipmentResult && (
                        <p className={`text-xs font-semibold ${shipmentResult.ok ? 'text-venom' : 'text-destructive'}`}>
                          {shipmentResult.message}
                          {shipmentResult.trackingNumber && (
                            <span className="font-mono ml-1">#{shipmentResult.trackingNumber}</span>
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowShipmentForm(selectedOrderData.id); setShipmentResult(null); }}
                      className="w-full bg-venom text-charcoal py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Create Shipment
                    </button>
                  )}
                </div>
              )}

              {/* Show tracking info if assigned */}
              {selectedOrderData.trackingNumber && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm mb-2">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Shipment Created
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    #{selectedOrderData.trackingNumber}
                  </p>
                </div>
              )}

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
