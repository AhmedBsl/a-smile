import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CarrierSlug, CarrierCredentials, CarrierPricing, TrackingResult } from './delivery/carriers';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  pieces?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  wilaya: string;
  commune: string;
  createdAt: string;
  notes?: string;
  carrier?: CarrierSlug;
  trackingNumber?: string;
  shippingCost?: number;
  carrierPricing?: 'home-delivery' | 'stop-desk';
  tracking?: TrackingResult;
}

export interface CartItem extends OrderItem {
  quantity: number;
}

export interface StoreState {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  carrierCredentials: CarrierCredentials[];
  carrierPricing: CarrierPricing[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, status: Order['status']) => void;
  setOrderCarrier: (id: string, carrier: CarrierSlug, trackingNumber: string) => void;
  updateOrderTracking: (id: string, tracking: TrackingResult) => void;
  setCarrierCredentials: (credentials: CarrierCredentials[]) => void;
  setCarrierPricing: (pricing: CarrierPricing[]) => void;
  updateCarrierPricing: (carrier: CarrierSlug, wilayaId: string, updates: Partial<CarrierPricing>) => void;
  getCart: () => CartItem[];
  getOrders: () => Order[];
  getProducts: () => Product[];
  backup: () => string;
  restore: (data: string) => boolean;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      orders: [],
      cart: [],
      carrierCredentials: [],
      carrierPricing: [],

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.productId === item.productId);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.productId !== productId),
        })),

      updateCartItem: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((c) => c.productId !== productId)
              : state.cart.map((c) =>
                  c.productId === productId ? { ...c, quantity } : c
                ),
        })),

      clearCart: () => set({ cart: [] }),

      createOrder: (order) =>
        set((state) => ({
          orders: [...state.orders, order],
          cart: [],
        })),

      updateOrder: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),

      setOrderCarrier: (id, carrier, trackingNumber) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, carrier, trackingNumber, status: 'processing' as const } : o
          ),
        })),

      updateOrderTracking: (id, tracking) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, tracking } : o
          ),
        })),

      setCarrierCredentials: (credentials) =>
        set({ carrierCredentials: credentials }),

      setCarrierPricing: (pricing) =>
        set({ carrierPricing: pricing }),

      updateCarrierPricing: (carrier, wilayaId, updates) =>
        set((state) => {
          const existing = state.carrierPricing.find(
            (p) => p.carrier === carrier && p.wilayaId === wilayaId
          );
          if (existing) {
            return {
              carrierPricing: state.carrierPricing.map((p) =>
                p.carrier === carrier && p.wilayaId === wilayaId
                  ? { ...p, ...updates }
                  : p
              ),
            };
          }
          return {
            carrierPricing: [
              ...state.carrierPricing,
              { carrier, wilayaId, homeDelivery: 500, stopDesk: 350, estimatedDays: '3-5', enabled: true, ...updates },
            ],
          };
        }),

      getCart: () => get().cart,
      getOrders: () => get().orders,
      getProducts: () => get().products,

      backup: () => {
        const state = get();
        return JSON.stringify({
          products: state.products,
          orders: state.orders,
          cart: state.cart,
        });
      },

      restore: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            products: parsed.products || [],
            orders: parsed.orders || [],
            cart: parsed.cart || [],
          });
          return true;
        } catch {
          return false;
        }
      },

    }),
    {
      name: 'melina-chic-store',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        cart: state.cart,
        carrierCredentials: state.carrierCredentials,
        carrierPricing: state.carrierPricing,
      }),
    }
  )
);
