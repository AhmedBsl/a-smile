export type CarrierSlug = 'yalidine' | 'zr-express' | 'ecotrack' | 'maystro' | 'colivraison' | 'mylers';

export interface CarrierConfig {
  slug: CarrierSlug;
  name: string;
  logo: string;
  website: string;
  apiBase: string;
  authType: 'key-token' | 'id-token' | 'token-only';
  authFields: { key: string; label: string; placeholder: string }[];
  coverage: 'nationwide' | 'major-cities' | 'targeted';
  homeDelivery: boolean;
  stopDesk: boolean;
  cod: boolean;
  estimatedDays: string;
  notes?: string;
}

export interface CarrierPricing {
  carrier: CarrierSlug;
  wilayaId: string;
  homeDelivery: number;
  stopDesk: number;
  estimatedDays: string;
  enabled: boolean;
}

export interface CarrierCredentials {
  carrier: CarrierSlug;
  credentials: Record<string, string>;
  enabled: boolean;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location?: string;
  details?: string;
}

export interface TrackingResult {
  carrier: CarrierSlug;
  trackingNumber: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'returned' | 'unknown';
  statusLabel: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}

export interface CreateShipmentPayload {
  carrier: CarrierSlug;
  order: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: string;
    wilaya: string;
    commune: string;
    notes?: string;
  };
  items: { name: string; quantity: number; price: number }[];
  codAmount: number;
  weight?: number;
}

export interface CreateShipmentResult {
  success: boolean;
  trackingNumber?: string;
  error?: string;
  raw?: unknown;
}

export const CARRIERS: CarrierConfig[] = [
  {
    slug: 'yalidine',
    name: 'Yalidine',
    logo: '📦',
    website: 'https://yalidine.app',
    apiBase: 'https://api.yalidine.app/v1',
    authType: 'key-token',
    authFields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Yalidine API key' },
      { key: 'token', label: 'Token', placeholder: 'Your Yalidine token' },
    ],
    coverage: 'nationwide',
    homeDelivery: true,
    stopDesk: true,
    cod: true,
    estimatedDays: '2-5',
    notes: 'Largest courier network in Algeria — 58 wilayas, 3000+ bureaus.',
  },
  {
    slug: 'zr-express',
    name: 'ZR Express / Procolis',
    logo: '🚚',
    website: 'https://zr-express.com',
    apiBase: 'https://api.zr-express.com/api/v1',
    authType: 'id-token',
    authFields: [
      { key: 'apiId', label: 'API ID', placeholder: 'Your ZR Express ID' },
      { key: 'token', label: 'Token', placeholder: 'Your ZR Express token' },
    ],
    coverage: 'nationwide',
    homeDelivery: true,
    stopDesk: true,
    cod: true,
    estimatedDays: '2-4',
    notes: 'Fast delivery in major cities — Algiers, Oran, Constantine, SBA.',
  },
  {
    slug: 'ecotrack',
    name: 'Ecotrack (DHD / Conexlog)',
    logo: '♻️',
    website: 'https://ecotrack.dz',
    apiBase: 'https://api.ecotrack.dz/v1',
    authType: 'token-only',
    authFields: [
      { key: 'token', label: 'API Token', placeholder: 'Your Ecotrack token' },
    ],
    coverage: 'targeted',
    homeDelivery: true,
    stopDesk: false,
    cod: true,
    estimatedDays: '3-6',
    notes: 'UPS partner — good for underserved areas and international forwarding.',
  },
  {
    slug: 'maystro',
    name: 'Maystro Delivery',
    logo: '📬',
    website: 'https://maystro.com',
    apiBase: 'https://api.maystro.com/v1',
    authType: 'token-only',
    authFields: [
      { key: 'token', label: 'API Token', placeholder: 'Your Maystro token' },
    ],
    coverage: 'nationwide',
    homeDelivery: true,
    stopDesk: true,
    cod: true,
    estimatedDays: '2-5',
    notes: 'Built for large stores — full 58 wilayas, bulk shipment support.',
  },
  {
    slug: 'colivraison',
    name: 'Colivraison Express',
    logo: '📮',
    website: 'https://colivraison.com',
    apiBase: 'https://api.colivraison.com/v1',
    authType: 'key-token',
    authFields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Your Colivraison API key' },
      { key: 'token', label: 'Token', placeholder: 'Your Colivraison token' },
    ],
    coverage: 'nationwide',
    homeDelivery: true,
    stopDesk: true,
    cod: true,
    estimatedDays: '2-5',
    notes: 'E-commerce focused — real-time tracking, automated notifications.',
  },
  {
    slug: 'mylers',
    name: 'Mylers',
    logo: '⚡',
    website: 'https://mylers.dz',
    apiBase: 'https://api.mylers.dz/v1',
    authType: 'token-only',
    authFields: [
      { key: 'token', label: 'API Token', placeholder: 'Your Mylers token' },
    ],
    coverage: 'major-cities',
    homeDelivery: true,
    stopDesk: false,
    cod: true,
    estimatedDays: '1-2',
    notes: 'Same-day delivery in Algiers, Oran, and Constantine only.',
  },
];

export function getCarrier(slug: CarrierSlug): CarrierConfig | undefined {
  return CARRIERS.find((c) => c.slug === slug);
}

export function getActiveCarriers(credentials: CarrierCredentials[]): CarrierConfig[] {
  const activeSlugs = new Set(credentials.filter((c) => c.enabled).map((c) => c.carrier));
  return CARRIERS.filter((c) => activeSlugs.has(c.slug));
}

export function getDefaultPricing(): CarrierPricing[] {
  const wilayaIds = [
    'sidi-bel-abbes', 'algiers', 'oran', 'constantine',
    'annaba', 'blida', 'tlemcen', 'setif',
  ];
  const pricing: CarrierPricing[] = [];
  for (const carrier of CARRIERS) {
    for (const wilayaId of wilayaIds) {
      pricing.push({
        carrier: carrier.slug,
        wilayaId,
        homeDelivery: carrier.slug === 'mylers' ? 500 : 550,
        stopDesk: carrier.slug === 'mylers' ? 0 : 400,
        estimatedDays: carrier.estimatedDays,
        enabled: true,
      });
    }
  }
  return pricing;
}
