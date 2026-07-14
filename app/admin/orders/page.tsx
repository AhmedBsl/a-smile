'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { FileText, Truck, Package, Trash2, Edit2, X, Check, ChevronLeft, Eye } from 'lucide-react';
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const statuses = ['pending', 'processing', 'shipped', 'delivered'] as const;
  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
  };
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-500/20 text-blue-700 border-blue-200',
    shipped: 'bg-purple-500/20 text-purple-700 border-purple-200',
    delivered: 'bg-green-500/20 text-green-700 border-green-200',
  };

  const selectedOrderData = sortedOrders.find((o) => o.id === selectedOrder);

  const activeCarriers = CARRIERS.filter((c) =>
    carrierCredentials.some((cred) => cred.carrier === c.slug && cred.enabled)
  );

  const handleDeleteOrder = (orderId: string) => {
    const store = useStore.getState();
    useStore.setState({
      orders: store.orders.filter((o) => o.id !== orderId),
    });
    setDeleteConfirm(null);
    if (selectedOrder === orderId) setSelectedOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: (typeof statuses)[number]) => {
    updateOrder(orderId, newStatus);
  };

  const handleSaveEdit = (orderId: string) => {
    const store = useStore.getState();
    useStore.setState({
      orders: store.orders.map((o) =>
        o.id === orderId ? { ...o, customerName: editName, customerPhone: editPhone } : o
      ),
    });
    setEditingOrder(null);
  };

  const handleStartEdit = (order: (typeof sortedOrders)[0]) => {
    setEditingOrder(order.id);
    setEditName(order.customerName);
    setEditPhone(order.customerPhone);
  };

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

  const handlePrintReceipt = (order: (typeof sortedOrders)[0]) => {
    const rows = order.items
      .map(
        (item) =>
          `<tr>
            <td style="text-align:right;padding:4px 0;border-bottom:1px dashed #ddd;font-size:11px">${item.name}</td>
            <td style="text-align:center;padding:4px 0;border-bottom:1px dashed #ddd;font-size:11px">${item.quantity}</td>
            <td style="text-align:left;padding:4px 0;border-bottom:1px dashed #ddd;font-size:11px">${item.price.toLocaleString()} DA</td>
          </tr>`
      )
      .join('');

    const addressLine = order.address
      ? '<div style="display:flex;justify-content:space-between;font-size:10px;line-height:1.6"><span>Adresse</span><span>' + order.address + '</span></div>'
      : '';

    const shippingLine = (order.shippingCost != null && order.shippingCost > 0)
      ? '<div style="display:flex;justify-content:space-between;font-size:10px;line-height:1.6"><span>Livraison</span><span>' + order.shippingCost.toLocaleString() + ' DA</span></div>'
      : '';

    const html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture - MELINA CHIC</title>',
      '<style>',
      '@page{margin:0;size:80mm auto}',
      '*{margin:0;padding:0;box-sizing:border-box}',
      'body{padding:10px;width:80mm;font-family:Courier New,monospace;color:#000}',
      '.header{text-align:center;margin-bottom:8px}',
      '.header h1{font-size:18px;letter-spacing:4px;font-weight:bold}',
      '.header h2{font-size:9px;color:#555;margin-top:2px}',
      '.divider{border-top:1px dashed #333;margin:6px 0}',
      '.info{font-size:10px;line-height:1.6}',
      '.row{display:flex;justify-content:space-between}',
      'table{width:100%;border-collapse:collapse;margin:6px 0;font-size:11px}',
      'th{text-align:center;font-size:10px;border-bottom:1px solid #333;padding:4px 0}',
      '.total{text-align:right;font-size:13px;font-weight:bold;margin-top:4px;padding-top:4px;border-top:1px double #333}',
      '.footer{text-align:center;font-size:9px;color:#888;margin-top:8px;border-top:1px dashed #333;padding-top:6px}',
      '</style></head><body>',
      '<div class="header"><h1>MELINA CHIC</h1><h2>' + order.id + '</h2></div>',
      '<div class="divider"></div>',
      '<div class="info">',
      '<div class="row"><span>Client</span><span>' + order.customerName + '</span></div>',
      '<div class="row"><span>Telephone</span><span>' + order.customerPhone + '</span></div>',
      '<div class="row"><span>Wilaya</span><span>' + order.wilaya + '</span></div>',
      '<div class="row"><span>Commune</span><span>' + order.commune + '</span></div>',
      addressLine,
      '</div>',
      '<div class="divider"></div>',
      '<table><thead><tr><th>Produit</th><th>Qte</th><th>Prix</th></tr></thead><tbody>',
      rows,
      '</tbody></table>',
      '<div class="divider"></div>',
      shippingLine,
      '<div class="total">Total: ' + order.total.toLocaleString() + ' DA</div>',
      '<div class="divider"></div>',
      '<div class="footer">Paiement a la livraison - Merci pour votre commande MELINA CHIC</div>',
      '</body></html>'
    ].join('\n');

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <AdminPageShell
      title="الطلبات"
      subtitle="إدارة وتتبع طلبات العملاء — الدفع عند الاستلام."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="space-y-3">
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
                الكل ({orders.length})
              </button>
              {statuses.map((status) => {
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-sm font-bold whitespace-nowrap text-sm transition-all ${
                      statusFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-muted'
                    }`}
                  >
                    {statusLabels[status]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {sortedOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-bold">
                {searchTerm || statusFilter ? 'لا توجد طلبات تطابق بحثك' : 'لا توجد طلبات بعد'}
              </p>
            </div>
          ) : (
            sortedOrders.map((order) => {
              const carrier = order.carrier ? CARRIERS.find((c) => c.slug === order.carrier) : null;
              const isEditing = editingOrder === order.id;
              const isSelected = selectedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-card border rounded-sm transition-all ${
                    isSelected ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border hover:border-primary/40'
                  }`}
                >
                  {/* Order Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-foreground font-mono text-sm">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className="text-lg font-black text-primary">{formatDZD(order.total)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 border border-border rounded-sm text-sm font-bold w-28"
                              placeholder="الاسم"
                            />
                            <input
                              type="tel"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="px-2 py-1 border border-border rounded-sm text-sm w-28"
                              dir="ltr"
                              placeholder="الهاتف"
                            />
                            <button
                              onClick={() => handleSaveEdit(order.id)}
                              className="p-1.5 bg-green-500 text-white rounded-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingOrder(null)}
                              className="p-1.5 bg-muted text-foreground rounded-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-bold truncate">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground" dir="ltr">{order.customerPhone}</p>
                          </>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items.length} {order.items.length !== 1 ? 'منتجات' : 'منتج'} · {order.wilaya} · {order.commune}
                        </p>
                        {carrier && (
                          <p className="text-xs text-primary mt-0.5 font-bold">
                            {carrier.logo} {carrier.name}
                            {order.trackingNumber && (
                              <span className="text-muted-foreground font-mono mr-1">
                                #{order.trackingNumber}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border shrink-0 ${statusColors[order.status] || 'bg-muted'}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as (typeof statuses)[number])}
                        className="text-xs font-bold px-2 py-1 rounded-sm border border-border bg-background"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{statusLabels[status]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedOrder(isSelected ? null : order.id)}
                        className={`p-2 rounded-sm transition-colors ${
                          isSelected ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                        }`}
                        title="عرض التفاصيل"
                      >
                        {isSelected ? <ChevronLeft className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleStartEdit(order)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                        title="طباعة الفاتورة"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {deleteConfirm === order.id ? (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-destructive text-white rounded-sm"
                          >
                            حذف
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-muted rounded-sm"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedOrderData ? (
            <div className="bg-card border border-border rounded-sm h-fit lg:sticky lg:top-24 overflow-hidden">
              {/* Sidebar Header */}
              <div className="bg-primary/5 border-b border-border p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-black text-foreground">تفاصيل الطلب</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{selectedOrderData.id}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(selectedOrderData.createdAt)}</p>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Customer Info */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">العميل</h3>
                  <p className="font-bold text-sm">{selectedOrderData.customerName}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{selectedOrderData.customerPhone}</p>
                </div>

                {/* Delivery Info */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">العنوان</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrderData.commune}, {selectedOrderData.wilaya}
                  </p>
                  {selectedOrderData.address && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedOrderData.address}</p>
                  )}
                  {selectedOrderData.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">ملاحظات: {selectedOrderData.notes}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">الحالة</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-sm border ${statusColors[selectedOrderData.status] || 'bg-muted'}`}>
                    {statusLabels[selectedOrderData.status]}
                  </span>
                </div>

                {/* Carrier */}
                {selectedOrderData.carrier && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">شركة الشحن</h3>
                    <div className="p-2 bg-primary/5 rounded-sm border border-primary/10">
                      <p className="text-xs font-bold text-primary">
                        {CARRIERS.find((c) => c.slug === selectedOrderData.carrier)?.logo}{' '}
                        {CARRIERS.find((c) => c.slug === selectedOrderData.carrier)?.name}
                      </p>
                      {selectedOrderData.trackingNumber && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          رقم التتبع: {selectedOrderData.trackingNumber}
                        </p>
                      )}
                      {selectedOrderData.shippingCost != null && selectedOrderData.shippingCost > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          تكلفة الشحن: {formatDZD(selectedOrderData.shippingCost)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">المنتجات</h3>
                  <div className="space-y-2">
                    {selectedOrderData.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size && <span>المقاس: {item.size}</span>}
                            {item.size && item.color && <span> · </span>}
                            {item.color && <span>اللون: {item.color}</span>}
                          </p>
                        </div>
                        <div className="text-left shrink-0 mr-3">
                          <p className="font-mono text-xs">{item.quantity} × {formatDZD(item.price)}</p>
                          <p className="font-mono text-xs font-bold">{formatDZD(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-mono">{formatDZD(selectedOrderData.total - (selectedOrderData.shippingCost || 0))}</span>
                  </div>
                  {selectedOrderData.shippingCost != null && selectedOrderData.shippingCost > 0 && (
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">الشحن</span>
                      <span className="font-mono">{formatDZD(selectedOrderData.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-base mt-2 pt-2 border-t border-border">
                    <span>الإجمالي</span>
                    <span className="text-primary">{formatDZD(selectedOrderData.total)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">الدفع عند الاستلام (COD)</p>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-border">
                  {!selectedOrderData.carrier && selectedOrderData.status !== 'delivered' && (
                    <>
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
                                <span className="font-mono mr-1">#{shipmentResult.trackingNumber}</span>
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => { setShowShipmentForm(selectedOrderData.id); setShipmentResult(null); }}
                          className="w-full bg-venom text-charcoal py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2 hover:opacity-90"
                        >
                          <Truck className="w-4 h-4" />
                          إنشاء شحنة
                        </button>
                      )}
                    </>
                  )}

                  {selectedOrderData.trackingNumber && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm">
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        تم إنشاء الشحنة
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        رقم التتبع: {selectedOrderData.trackingNumber}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(selectedOrderData)}
                    className="w-full bg-primary text-primary-foreground py-2.5 font-bold rounded-sm text-sm flex items-center justify-center gap-2 hover:opacity-90"
                  >
                    <FileText className="w-4 h-4" />
                    طباعة الفاتورة
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-sm p-12 text-center lg:sticky lg:top-24">
              <Eye className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-bold">اختر طلباً لعرض التفاصيل</p>
              <p className="text-muted-foreground text-xs mt-1">اضغط على زر العرض في أي طلب</p>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
