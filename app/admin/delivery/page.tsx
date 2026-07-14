'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AdminPageShell } from '@/components/admin-page-shell';
import { formatDZD } from '@/lib/format';
import { CARRIERS } from '@/lib/delivery/carriers';
import { CarrierSlug } from '@/lib/delivery/carriers';
import { WILAYAS } from '@/lib/sample-data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, MapPin, Settings, Check, X, ExternalLink,
  ChevronDown, Globe, Package, Zap, Shield, ToggleLeft, ToggleRight,
} from 'lucide-react';

export default function DeliveryPage() {
  const carrierCredentials = useStore((s) => s.carrierCredentials);
  const carrierPricing = useStore((s) => s.carrierPricing);
  const setCarrierCredentials = useStore((s) => s.setCarrierCredentials);
  const setCarrierPricing = useStore((s) => s.setCarrierPricing);
  const updateCarrierPricing = useStore((s) => s.updateCarrierPricing);

  const [activeTab, setActiveTab] = useState<'carriers' | 'pricing' | 'zones'>('carriers');
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);
  const [editCarrier, setEditCarrier] = useState<string | null>(null);
  const [tempCredentials, setTempCredentials] = useState<Record<string, string>>({});
  const [testingCarrier, setTestingCarrier] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ carrier: string; ok: boolean; message: string } | null>(null);

  const isCarrierEnabled = (slug: CarrierSlug) =>
    carrierCredentials.some((c) => c.carrier === slug && c.enabled);

  const getCarrierCredentials = (slug: CarrierSlug) =>
    carrierCredentials.find((c) => c.carrier === slug);

  const toggleCarrier = (slug: CarrierSlug) => {
    const existing = carrierCredentials.find((c) => c.carrier === slug);
    if (existing) {
      setCarrierCredentials(
        carrierCredentials.map((c) =>
          c.carrier === slug ? { ...c, enabled: !c.enabled } : c
        )
      );
    } else {
      setCarrierCredentials([
        ...carrierCredentials,
        { carrier: slug, credentials: {}, enabled: true },
      ]);
    }
  };

  const saveCredentials = (slug: CarrierSlug) => {
    const existing = carrierCredentials.find((c) => c.carrier === slug);
    if (existing) {
      setCarrierCredentials(
        carrierCredentials.map((c) =>
          c.carrier === slug ? { ...c, credentials: tempCredentials, enabled: true } : c
        )
      );
    } else {
      setCarrierCredentials([
        ...carrierCredentials,
        { carrier: slug, credentials: tempCredentials, enabled: true },
      ]);
    }
    setEditCarrier(null);
    setTempCredentials({});
  };

  const getPricingForCarrier = (slug: CarrierSlug) =>
    carrierPricing.filter((p) => p.carrier === slug);

  const tabs = [
    { key: 'carriers' as const, label: 'Carriers', icon: Truck },
    { key: 'pricing' as const, label: 'Pricing', icon: Settings },
    { key: 'zones' as const, label: 'Zones', icon: MapPin },
  ];

  return (
    <AdminPageShell
      title="Delivery"
      subtitle="Manage carriers, pricing, and shipping zones."
      actions={
        <div className="flex items-center gap-2">
          {CARRIERS.filter((c) => isCarrierEnabled(c.slug)).length > 0 && (
            <span className="text-xs font-mono text-venom bg-venom/10 px-2 py-1 rounded-sm">
              {CARRIERS.filter((c) => isCarrierEnabled(c.slug)).length} active
            </span>
          )}
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Carriers Tab */}
      {activeTab === 'carriers' && (
        <div className="space-y-4">
          {CARRIERS.map((carrier) => {
            const enabled = isCarrierEnabled(carrier.slug);
            const creds = getCarrierCredentials(carrier.slug);
            const isEditing = editCarrier === carrier.slug;

            return (
              <motion.div
                key={carrier.slug}
                layout
                className={`bg-card border rounded-sm overflow-hidden transition-all ${
                  enabled ? 'border-venom/30' : 'border-border'
                }`}
              >
                {/* Carrier Header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedCarrier(expandedCarrier === carrier.slug ? null : carrier.slug)}
                >
                  <span className="text-2xl">{carrier.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm">{carrier.name}</h3>
                      {enabled && (
                        <span className="text-[9px] font-mono bg-venom/20 text-venom px-1.5 py-0.5 rounded-sm">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{carrier.notes}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                      {carrier.homeDelivery && <Package className="w-3 h-3" />}
                      {carrier.stopDesk && <MapPin className="w-3 h-3" />}
                      {carrier.cod && <span className="font-mono">COD</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCarrier(carrier.slug);
                      }}
                      className="p-1"
                    >
                      {enabled ? (
                        <ToggleRight className="w-8 h-8 text-venom" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        expandedCarrier === carrier.slug ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedCarrier === carrier.slug && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-4 space-y-4">
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Coverage</p>
                            <p className="text-sm font-bold flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-primary" />
                              {carrier.coverage === 'nationwide' ? '58 Wilayas' : carrier.coverage === 'major-cities' ? 'Major Cities' : 'Targeted'}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Delivery</p>
                            <p className="text-sm font-bold flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-primary" />
                              {carrier.estimatedDays} days
                            </p>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Services</p>
                            <div className="flex gap-1.5">
                              {carrier.homeDelivery && (
                                <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">Home</span>
                              )}
                              {carrier.stopDesk && (
                                <span className="text-[9px] font-mono bg-clay/10 text-clay px-1.5 py-0.5 rounded-sm">Desk</span>
                              )}
                            </div>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Auth</p>
                            <p className="text-sm font-bold flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-primary" />
                              {carrier.authType === 'key-token' ? 'Key + Token' : carrier.authType === 'id-token' ? 'ID + Token' : 'Token'}
                            </p>
                          </div>
                        </div>

                        {/* API Credentials */}
                        <div className="p-4 bg-muted/20 border border-border rounded-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" />
                              API Credentials
                            </h4>
                            <a
                              href={carrier.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Get API keys <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {isEditing ? (
                            <div className="space-y-3">
                              {carrier.authFields.map((field) => (
                                <div key={field.key}>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                    {field.label}
                                  </label>
                                  <input
                                    type="password"
                                    value={tempCredentials[field.key] || ''}
                                    onChange={(e) =>
                                      setTempCredentials({ ...tempCredentials, [field.key]: e.target.value })
                                    }
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2 border border-border rounded-sm bg-background text-sm font-mono"
                                  />
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveCredentials(carrier.slug)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-venom text-charcoal text-xs font-bold rounded-sm"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                                <button
                                  onClick={() => { setEditCarrier(null); setTempCredentials({}); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-bold rounded-sm hover:bg-muted"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {creds && Object.keys(creds.credentials).length > 0 ? (
                                <div className="space-y-1.5">
                                  {Object.entries(creds.credentials).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                      <span className="text-muted-foreground font-mono text-xs w-20">{key}:</span>
                                      <span className="font-mono text-xs">{'•'.repeat(12)}</span>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      setEditCarrier(carrier.slug);
                                      setTempCredentials(creds.credentials);
                                    }}
                                    className="text-xs text-primary hover:underline mt-2"
                                  >
                                    Update credentials
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center py-3">
                                  <p className="text-xs text-muted-foreground mb-2">No credentials configured</p>
                                  <button
                                    onClick={() => setEditCarrier(carrier.slug)}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Add credentials
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {carrier.notes && (
                          <p className="text-xs text-muted-foreground italic">{carrier.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold">Carrier</th>
                    <th className="text-left px-4 py-3 font-bold">Wilaya</th>
                    <th className="text-left px-4 py-3 font-bold">Home Delivery</th>
                    <th className="text-left px-4 py-3 font-bold">Stop Desk</th>
                    <th className="text-left px-4 py-3 font-bold">Days</th>
                    <th className="text-left px-4 py-3 font-bold">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {carrierPricing.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No pricing configured. Enable carriers first.
                      </td>
                    </tr>
                  ) : (
                    carrierPricing.map((pricing, index) => {
                      const carrier = CARRIERS.find((c) => c.slug === pricing.carrier);
                      const wilaya = WILAYAS.find((w) => w.id === pricing.wilayaId);
                      return (
                        <motion.tr
                          key={`${pricing.carrier}-${pricing.wilayaId}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-border hover:bg-muted/40"
                        >
                          <td className="px-4 py-2.5 font-semibold text-xs">
                            {carrier?.logo} {carrier?.name}
                          </td>
                          <td className="px-4 py-2.5 text-xs">{wilaya?.name || pricing.wilayaId}</td>
                          <td className="px-4 py-2.5 font-mono text-xs">{formatDZD(pricing.homeDelivery)}</td>
                          <td className="px-4 py-2.5 font-mono text-xs">
                            {pricing.stopDesk > 0 ? formatDZD(pricing.stopDesk) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{pricing.estimatedDays}d</td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() =>
                                updateCarrierPricing(pricing.carrier, pricing.wilayaId, { enabled: !pricing.enabled })
                              }
                              className="p-0.5"
                            >
                              {pricing.enabled ? (
                                <Check className="w-4 h-4 text-venom" />
                              ) : (
                                <X className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
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

          <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-sm">
            <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Delivery fees are calculated at checkout based on the selected carrier and wilaya.
              Cash on delivery (COD) is the default payment method.
            </p>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
