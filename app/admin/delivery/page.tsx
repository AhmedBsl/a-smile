'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { WILAYAS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { motion } from 'framer-motion';
import { Truck, MapPin } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <AdminPageShell
      title="Delivery"
      subtitle="Shipping zones by wilaya — powers checkout delivery fees."
    >
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Wilaya</th>
                <th className="text-left px-4 py-3 font-bold">Home Delivery</th>
                <th className="text-left px-4 py-3 font-bold">Stop Desk</th>
                <th className="text-left px-4 py-3 font-bold">Est. Days</th>
                <th className="text-left px-4 py-3 font-bold">Communes</th>
              </tr>
            </thead>
            <tbody>
              {WILAYAS.map((zone, index) => (
                <motion.tr
                  key={zone.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-border hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-semibold flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {zone.name}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatDZD(zone.homeDelivery)}</td>
                  <td className="px-4 py-3 font-mono">{formatDZD(zone.stopDesk)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{zone.days} days</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {zone.communes.slice(0, 3).join(', ')}
                    {zone.communes.length > 3 && ` +${zone.communes.length - 3}`}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-sm">
        <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Delivery fees are calculated automatically at checkout based on the customer&apos;s
          selected wilaya. Cash on delivery is the default payment method.
        </p>
      </div>
    </AdminPageShell>
  );
}
