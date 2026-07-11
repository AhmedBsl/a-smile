'use client';

import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { motion } from 'framer-motion';
import { Users, TrendingUp, BarChart3, Star } from 'lucide-react';
import { formatDZD, formatDate } from '@/lib/format';

export default function CustomersPage() {
  const orders = useStore((state) => state.orders);

  const customerMap = new Map<
    string,
    {
      key: string;
      name: string;
      email: string;
      phone: string;
      ordersCount: number;
      totalSpent: number;
      lastOrder: Date;
      joinedDate: Date;
    }
  >();

  orders.forEach((order) => {
    const key = order.customerPhone || order.customerEmail || order.customerName;
    const existing = customerMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += order.total;
      const orderDate = new Date(order.createdAt);
      if (orderDate > existing.lastOrder) existing.lastOrder = orderDate;
    } else {
      customerMap.set(key, {
        key,
        name: order.customerName,
        email: order.customerEmail || '—',
        phone: order.customerPhone,
        ordersCount: 1,
        totalSpent: order.total,
        lastOrder: new Date(order.createdAt),
        joinedDate: new Date(order.createdAt),
      });
    }
  });

  const customers = Array.from(customerMap.values());
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const repeatCustomers = customers.filter((c) => c.ordersCount > 1).length;

  return (
    <AdminPageShell
      title="Customers"
      subtitle="Derived from order history — keyed by phone number."
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users },
          { label: 'Total Revenue', value: formatDZD(totalRevenue), icon: TrendingUp },
          { label: 'Avg Order Value', value: formatDZD(avgOrderValue), icon: BarChart3 },
          { label: 'Repeat Customers', value: repeatCustomers, icon: Star },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card border border-border rounded-sm p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-2xl font-black font-mono">{kpi.value}</p>
                </div>
                <Icon className="w-10 h-10 text-primary/15" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-black">All Customers ({customers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Name</th>
                <th className="text-left px-4 py-3 font-bold">Phone</th>
                <th className="text-left px-4 py-3 font-bold">Email</th>
                <th className="text-left px-4 py-3 font-bold">Orders</th>
                <th className="text-left px-4 py-3 font-bold">Total Spent</th>
                <th className="text-left px-4 py-3 font-bold">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No customers yet — they appear when orders are placed.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.key} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold">{customer.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{customer.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                    <td className="px-4 py-3 font-bold">{customer.ordersCount}</td>
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {formatDZD(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(customer.lastOrder)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {topCustomers.length > 0 && (
        <div className="mt-6">
          <h2 className="font-black mb-3">Top Customers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topCustomers.map((c) => (
              <div key={c.key} className="bg-card border border-border rounded-sm p-4">
                <p className="font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{c.phone}</p>
                <p className="text-primary font-black mt-2">{formatDZD(c.totalSpent)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
