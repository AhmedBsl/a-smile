'use client';

import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDZD, formatDate } from '@/lib/format';
import { isUsingDefaultPassword } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const products = useStore((state) => state.products);
  const orders = useStore((state) => state.orders);
  const [showPasswordBanner, setShowPasswordBanner] = useState(false);

  useEffect(() => {
    isUsingDefaultPassword().then(setShowPasswordBanner);
  }, []);

  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const newOrders = orders.filter((o) => o.status === 'pending');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 10);
  const recentOrders = [...orders].reverse().slice(0, 8);
  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled' as any).length;

  const stats = [
    {
      title: 'طلبات هذا الشهر',
      value: thisMonth.length.toString(),
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'طلبات جديدة',
      value: newOrders.length.toString(),
      icon: AlertTriangle,
      href: '/admin/orders',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
      highlight: newOrders.length > 0,
    },
    {
      title: 'إجمالي الإيرادات',
      value: formatDZD(totalRevenue),
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'text-venom',
      bgColor: 'bg-venom/10',
    },
    {
      title: 'المنتجات',
      value: products.length.toString(),
      icon: Package,
      href: '/admin/products',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-700',
    processing: 'bg-blue-500/20 text-blue-700',
    shipped: 'bg-purple-500/20 text-purple-700',
    delivered: 'bg-venom/20 text-charcoal',
  };

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    pending: Clock,
    processing: Package,
    shipped: ArrowRight,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  return (
    <AdminPageShell
      title="لوحة التحكم"
      subtitle="نظرة عامة على متجرك — الطلبات، الإيرادات، والمخزون."
    >
      {showPasswordBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <p className="text-sm font-semibold text-foreground">
            أنت تستخدم كلمة المرور الافتراضية. قم بتغييرها في الإعدادات لتحسين الأمان.
          </p>
          <Link
            href="/admin/settings"
            className="text-sm font-bold text-primary hover:underline shrink-0"
          >
            تغيير كلمة المرور ←
          </Link>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link href={stat.href}>
                <div
                  className={`bg-card border p-5 rounded-sm hover:border-primary/40 transition-all group ${
                    stat.highlight ? 'border-primary/50 shadow-sm' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-sm ${stat.bgColor} ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-black text-foreground font-mono">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                    {stat.title}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'تم التوصيل', value: deliveredOrders, color: 'text-venom' },
          { label: 'قيد الانتظار', value: newOrders.length, color: 'text-yellow-600' },
          { label: 'مخزون منخفض', value: lowStock.length, color: 'text-primary' },
          { label: 'متوسط القيمة', value: formatDZD(orders.length > 0 ? totalRevenue / orders.length : 0), color: 'text-foreground' },
        ].map((item) => (
          <div key={item.label} className="bg-muted/50 rounded-sm p-3 text-center">
            <p className={`text-lg font-black font-mono ${item.color}`}>{item.value}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-black text-sm uppercase tracking-wider">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-xs text-primary font-bold hover:underline">
              عرض الكل ←
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-12 text-sm">
                لا توجد طلبات بعد — ستظهر هنا عندما يقوم العملاء بالشراء.
              </p>
            ) : (
              recentOrders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-sm ${statusColors[order.status] || 'bg-muted'}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {order.customerName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {order.id} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-black text-primary text-sm font-mono">
                        {formatDZD(order.total)}
                      </p>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                          statusColors[order.status] ?? 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="bg-card border border-border rounded-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-black text-sm uppercase tracking-wider">مخزون منخفض</h2>
              <Link href="/admin/inventory" className="text-xs text-primary font-bold hover:underline">
                إدارة ←
              </Link>
            </div>
            <div className="p-3 space-y-1">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  جميع المنتجات متوفرة بشكل جيد
                </p>
              ) : (
                lowStock.slice(0, 5).map((product) => (
                  <Link
                    key={product.id}
                    href="/admin/products"
                    className="flex items-center justify-between p-2.5 rounded-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs font-semibold truncate">{product.name}</span>
                    <span className="text-[10px] font-mono font-bold text-primary shrink-0 ml-2">
                      {product.stock} متبقي
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-card border border-border rounded-sm">
            <div className="p-5 border-b border-border">
              <h2 className="font-black text-sm uppercase tracking-wider">أفضل المنتجات</h2>
            </div>
            <div className="p-3 space-y-1">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">لا توجد منتجات بعد</p>
              ) : (
                topProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2.5 rounded-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}.</span>
                      <span className="text-xs font-semibold truncate">{product.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-primary shrink-0 ml-2">
                      {formatDZD(product.price)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
