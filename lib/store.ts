import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  size?: string;
  color?: string;
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
}

export interface CartItem extends OrderItem {
  quantity: number;
}

export interface StoreState {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (order: Order) => void;
  updateOrder: (id: string, status: Order['status']) => void;
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
      name: 'smile-store',
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        cart: state.cart,
      }),
    }
  )
);
