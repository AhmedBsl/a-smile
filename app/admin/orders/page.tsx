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
  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
  };
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
      setShipmentResult({ ok: false, message: 'لا توجد بيانات اعتماد لشركة الشحن هذه' });
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
        setShipmentResult({ ok: true, message: 'تم إنشاء الشحنة!', trackingNumber: data.trackingNumber });
        setShowShipmentForm(null);
      } else {
        setShipmentResult({ ok: false, message: data.error || 'فشل إنشاء الشحنة' });
      }
    } catch {
      setShipmentResult({ ok: false, message: 'خطأ في الشبكة — تعذر الوصول لخدمة الشحن' });
    } finally {
      setCreatingShipment(false);
    }
  };

  return (
    <AdminPageShell
      title="الطلبات"
      subtitle="إدارة وتتبع طلبات العملاء — الدفع عند الاستلام."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="البحث حسب رقم الطلب، الاسم، أو الهاتف..."
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
                الكل
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
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-sm p-12 text-center">
                <p className="text-muted-foreground text-sm">
                   {searchTerm || statusFilter ? 'لا توجد طلبات تطابق بحثك' : 'لا توجد طلبات بعد'}
                </p>
              </div>
            ) : (
              [...filteredOrders]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => {
                  const carrier = order.carrier ? CARRIERS.find((c) => c.slug === order.carrier) : null;
  const handlePrintReceipt = () => {
    if (!selectedOrderData) return;
    const o = selectedOrderData;
    const itemsHtml = o.items
      .map(
        (item, i) =>
          `<tr key="${i}">
            <td style="text-align:right;padding:4px 0;border-bottom:1px dashed #ddd;font-size:11px">${item.name}</td>
            <td style="text-align:center;padding:4px 0;border-bottom:1px dashed #ddd;font-size:11px">${item.quantity}</td>
            <td style="text-align:left;padding:4px 0;border-bottom:1px dashed #ddd;font-size:11px">${item.price.toLocaleString()} دج</td>
          </tr>`
      )
      .join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>فاتورة - MELINA CHIC</title>
  <style>
    @page { margin: 0; size: 80mm auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }
    body { padding: 10px; width: 80mm; color: #000; }
    .header { text-align: center; margin-bottom: 8px; }
    .header h1 { font-size: 18px; letter-spacing: 4px; font-weight: bold; }
    .header h2 { font-size: 9px; color: #555; margin-top: 2px; }
    .divider { border-top: 1px dashed #333; margin: 6px 0; }
    .info { font-size: 10px; line-height: 1.6; }
    .info-row { display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 11px; }
    th { text-align: center; font-size: 10px; border-bottom: 1px solid #333; padding: 4px 0; }
    .total { text-align: left; font-size: 13px; font-weight: bold; margin-top: 4px; padding-top: 4px; border-top: 1px double #333; }
    .footer { text-align: center; font-size: 9px; color: #888; margin-top: 8px; border-top: 1px dashed #333; padding-top: 6px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>MELINA CHIC</h1>
    <h2>${o.id}</h2>
  </div>
  <div class="divider"></div>
  <div class="info">
    <div class="info-row"><span>العميل</span><span>${o.customerName}</span></div>
    <div class="info-row"><span>الهاتف</span><span>${o.customerPhone}</span></div>
    <div class="info-row"><span>الولاية</span><span>${o.wilaya}</span></div>
    <div class="info-row"><span>البلدية</span><span>${o.commune}</span></div>
    <div class="info-row"><span>التوصيل</span><span>${o.deliveryType === 'home' ? 'منزل' : 'مكتب بريد'}</span></div>
    ${o.bureaus && o.bureaus.length ? '<div class="info-row"><span>المكاتب</span><span>' + o.bureaus.join(', ') + '</span></div>' : ''}
  </div>
  <div class="divider"></div>
  <table>
    <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="divider"></div>
  <div class="total">المجموع: ${o.total.toLocaleString()} دج</div>
  <div class="divider"></div>
  <div class="footer">الدفع عند الاستلام • شكراً لتسوقك مع MELINA CHIC</div>
  <script>window.onload = function() { window.print(); window.close(); }</script>
</body>
</html>`);
    win.document.close();
  };

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
                                                        {order.items.length} {order.items.length !== 1 ? 'منتجات' : 'منتج'} · {order.wilaya}
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
                  {statusLabels[status]}
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
            <h2 className="font-black text-foreground mb-5">تفاصيل الطلب</h2>

            <div className="mb-5 pb-5 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                العميل
              </h3>
              <p className="font-bold text-sm">{selectedOrderData.customerName}</p>
              <p className="text-sm text-muted-foreground">{selectedOrderData.customerPhone}</p>
              {selectedOrderData.customerEmail && (
                <p className="text-sm text-muted-foreground">{selectedOrderData.customerEmail}</p>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-border">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                التوصيل
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
                      التتبع: {selectedOrderData.trackingNumber}
                    </p>
                  )}
                  {selectedOrderData.shippingCost && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      الشحن: {formatDZD(selectedOrderData.shippingCost)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-5 pb-5 border-b border-border space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                المنتجات
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
              <span>الإجمالي (COD)</span>
              <span className="text-primary">{formatDZD(selectedOrderData.total)}</span>
            </p>

            <div className="space-y-2">
              {/* Create Shipment Button (if no carrier assigned) */}
              {!selectedOrderData.carrier && selectedOrderData.status !== 'delivered' && (
                <div className="mb-3">
                  {showShipmentForm === selectedOrderData.id ? (
                    <div className="space-y-2 p-3 bg-muted/30 border border-border rounded-sm">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        اختر شركة الشحن
                      </label>
                      <select
                        value={shipmentCarrier}
                        onChange={(e) => setShipmentCarrier(e.target.value as CarrierSlug)}
                        className="w-full px-3 py-2 border border-border rounded-sm bg-background text-sm"
                      >
                        <option value="">اختر الشركة...</option>
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
                          {creatingShipment ? 'جارٍ الإنشاء...' : 'إنشاء شحنة'}
                        </button>
                        <button
                          onClick={() => { setShowShipmentForm(null); setShipmentResult(null); }}
                          className="px-3 py-2 border border-border rounded-sm text-xs font-bold hover:bg-muted"
                        >
                          إلغاء
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
                      إنشاء شحنة
                    </button>
                  )}
                </div>
              )}

              {/* Show tracking info if assigned */}
              {selectedOrderData.trackingNumber && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm mb-2">
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    تم إنشاء الشحنة
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    #{selectedOrderData.trackingNumber}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full bg-primary text-primary-foreground py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                طباعة الفاتورة
              </button>
              <button
                type="button"
                className="w-full border border-border py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2 hover:bg-muted"
              >
                <Download className="w-4 h-4" />
                تصدير
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AdminPageShell>
  );
}
