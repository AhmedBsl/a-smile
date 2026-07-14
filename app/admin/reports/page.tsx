'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Download, Filter, Calendar } from 'lucide-react';
import { formatDZD } from '@/lib/format';

export default function ReportsPage() {
  const orders = useStore((state) => state.orders);
  const products = useStore((state) => state.products);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  const filteredOrders = orders.filter((order) => {
    if (timeRange === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const days = timeRange === 'week' ? 7 : 30;
    return (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24) <= days;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItems = filteredOrders.reduce((sum, o) => sum + o.items.length, 0);

  // Calculate top selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productSales.get(item.productId) || { name: item.productId, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
      existing.name = item.name;
      productSales.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const handleExportCSV = () => {
    const csv = [
      ['رقم الطلب', 'العميل', 'العناصر', 'الإجمالي', 'الحالة', 'التاريخ'],
      ...filteredOrders.map((o) => [
        o.id,
        o.customerName,
        o.items.length,
        `${o.total}`,
        o.status,
        new Date(o.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-report-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <AdminPageShell
      title="التقارير"
      subtitle="تحليلات المبيعات والأداء"
      actions={
        <motion.button
          onClick={handleExportCSV}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm font-bold text-sm"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </motion.button>
      }
    >
      {/* Time Range Filter */}
      <div className="flex gap-2 mb-8">
          {(['week', 'month', 'all'] as const).map((option) => (
            <motion.button
              key={option}
              onClick={() => setTimeRange(option)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-semibold capitalize transition-all ${
                timeRange === option
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted-foreground/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-4 h-4" />
              {option === 'week' ? 'أسبوع' : option === 'month' ? 'شهر' : 'الكل'}
            </motion.button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-sm p-6"
        >
          <p className="text-muted-foreground text-sm mb-1">إجمالي الإيرادات</p>
          <p className="text-3xl font-black text-foreground font-mono">{formatDZD(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-2">{filteredOrders.length} طلب</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-sm p-6"
        >
          <p className="text-muted-foreground text-sm mb-1">إجمالي الطلبات</p>
          <p className="text-3xl font-black text-foreground font-mono">{totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">آخر {timeRange === 'week' ? '7' : timeRange === 'month' ? '30' : 'الكل'} يوم</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-sm p-6"
        >
          <p className="text-muted-foreground text-sm mb-1">متوسط قيمة الطلب</p>
          <p className="text-3xl font-black text-foreground font-mono">{formatDZD(avgOrderValue)}</p>
          <p className="text-xs text-muted-foreground mt-2">لكل معاملة</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-sm p-6"
        >
          <p className="text-muted-foreground text-sm mb-1">إجمالي العناصر المباعة</p>
          <p className="text-3xl font-black text-foreground font-mono">{totalItems}</p>
          <p className="text-xs text-muted-foreground mt-2">المنتجات المشحونة</p>
        </motion.div>
      </div>

      {/* Top Products */}
      <div className="bg-card border border-border rounded-sm p-6 mb-8">
        <h2 className="text-xl font-black text-foreground mb-6">المنتجات الأكثر مبيعاً</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 font-bold text-foreground text-sm">المنتج</th>
                <th className="text-right px-4 py-3 font-bold text-foreground text-sm">الكمية</th>
                <th className="text-right px-4 py-3 font-bold text-foreground text-sm">الإيرادات</th>
                <th className="text-left px-4 py-3 font-bold text-foreground text-sm">% من الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <motion.tr
                  key={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-foreground text-sm">{product.name}</td>
                  <td className="px-4 py-3 text-foreground text-sm">{product.quantity}</td>
                  <td className="px-4 py-3 font-bold text-primary text-sm font-mono">{formatDZD(product.revenue)}</td>
                  <td className="px-4 py-3 text-foreground text-sm">{totalRevenue > 0 ? ((product.revenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-black text-foreground">آخر الطلبات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-right px-6 py-4 font-bold text-foreground text-sm">رقم الطلب</th>
                <th className="text-right px-6 py-4 font-bold text-foreground text-sm">العميل</th>
                <th className="text-right px-6 py-4 font-bold text-foreground text-sm">العناصر</th>
                <th className="text-right px-6 py-4 font-bold text-foreground text-sm">الإجمالي</th>
                <th className="text-right px-6 py-4 font-bold text-foreground text-sm">الحالة</th>
                <th className="text-left px-6 py-4 font-bold text-foreground text-sm">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 20).map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm text-foreground">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-semibold text-foreground text-sm">{order.customerName}</td>
                  <td className="px-6 py-4 text-foreground text-sm">{order.items.length}</td>
                  <td className="px-6 py-4 font-bold text-primary text-sm font-mono">{formatDZD(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-sm text-xs font-bold ${
                      order.status === 'delivered'
                        ? 'bg-venom/20 text-charcoal'
                        : order.status === 'shipped'
                        ? 'bg-blue-500/20 text-blue-700'
                        : order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-700'
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'processing' ? 'قيد المعالجة' : order.status === 'shipped' ? 'تم الشحن' : order.status === 'delivered' ? 'تم التوصيل' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
