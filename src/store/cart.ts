import { create } from 'zustand';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    discount: number;
    images: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  subtotal: number;
  savings: number;
  isOpen: boolean;
  sessionId: string;
  setSessionId: (id: string) => void;
  setItems: (items: CartItem[], subtotal: number, savings: number) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  subtotal: 0,
  savings: 0,
  isOpen: false,
  sessionId: typeof window !== 'undefined' ? localStorage.getItem('cartSessionId') || '' : '',

  setSessionId: (id) => {
    if (typeof window !== 'undefined') localStorage.setItem('cartSessionId', id);
    set({ sessionId: id });
  },

  setItems: (items, subtotal, savings) => set({ items, subtotal, savings, total: items.length }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        const items = state.items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
        return { items };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),

  clearCart: () => set({ items: [], total: 0, subtotal: 0, savings: 0 }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
}));