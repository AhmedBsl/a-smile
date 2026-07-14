'use client';

import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDZD } from '@/lib/format';

export default function AdminAnalyticsPage() {
  const orders = useStore((state) => state.orders);
  const products = useStore((state) => state.products);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = products.length;

  const revenueByStatus = [
    { name: 'قيد الانتظار', value: orders.filter((o) => o.status === 'pending').reduce((sum, o) => sum + o.total, 0) },
    { name: 'قيد المعالجة', value: orders.filter((o) => o.status === 'processing').reduce((sum, o) => sum + o.total, 0) },
    { name: 'تم الشحن', value: orders.filter((o) => o.status === 'shipped').reduce((sum, o) => sum + o.total, 0) },
    { name: 'تم التوصيل', value: orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0) },
  ].filter((item) => item.value > 0);

  const ordersData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders.filter(
      (o) =>
        new Date(o.createdAt).toLocaleDateString() ===
        date.toLocaleDateString()
    );
    return {
      date: date.toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
    };
  });

  const topProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      stock: p.stock,
      price: p.price,
    }));

  const COLORS = ['#C1272D', '#C9E100', '#8A5A44', '#1B1B1B'];

  return (
    <AdminPageShell
      title="الإحصائيات"
      subtitle="مقاييس المبيعات والأداء عبر متجرك."
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الإيرادات', value: formatDZD(totalRevenue), color: 'text-primary' },
            { label: 'إجمالي الطلبات', value: totalOrders.toString(), color: 'text-blue-700' },
            { label: 'متوسط قيمة الطلب', value: formatDZD(avgOrderValue), color: 'text-venom' },
            { label: 'المنتجات', value: totalProducts.toString(), color: 'text-accent' },
          ].map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card border border-border p-5 rounded-sm"
            >
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-5 rounded-sm">
            <h2 className="text-lg font-black text-foreground mb-4">الطلبات والإيرادات (آخر 7 أيام)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} dataKey="date" />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#C1272D" strokeWidth={2} name="الطلبات" />
                <Line type="monotone" dataKey="revenue" stroke="#C9E100" strokeWidth={2} name="الإيرادات" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {revenueByStatus.length > 0 && (
            <div className="bg-card border border-border p-5 rounded-sm">
              <h2 className="text-lg font-black text-foreground mb-4">الإيرادات حسب حالة الطلب</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatDZD(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDZD(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border p-5 rounded-sm">
          <h2 className="text-lg font-black text-foreground mb-4">أفضل المنتجات حسب المخزون</h2>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">لا توجد منتجات بعد</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} dataKey="name" />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <Legend />
                <Bar dataKey="stock" fill="#C1272D" name="المخزون" />
                <Bar dataKey="price" fill="#C9E100" name="السعر" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
