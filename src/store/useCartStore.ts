import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique ID for cart item (could be product.id + variant.id)
  productId: string;
  name: string;
  slug: string;
  price: number; // Base price (after flash sale/regular discount, but before tier discount)
  image: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
  stock: number;
  tiers?: { minQty: number; maxQty: number | null; discountPct: number | string }[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
        
        if (existingItemIndex >= 0) {
          // Item exists, update quantity (respecting stock limit)
          const updatedItems = [...state.items];
          const newQty = updatedItems[existingItemIndex].quantity + newItem.quantity;
          updatedItems[existingItemIndex].quantity = Math.min(newQty, newItem.stock);
          return { items: updatedItems };
        } else {
          // New item
          return { items: [...state.items, newItem] };
        }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => {
          if (item.id === id) {
            return { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) };
          }
          return item;
        })
      })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          let unitPrice = item.price;
          // Apply tiered discount if applicable
          if (item.tiers && item.tiers.length > 0) {
            const activeTier = item.tiers.find(t => item.quantity >= t.minQty && (t.maxQty === null || item.quantity <= t.maxQty));
            if (activeTier) {
              unitPrice = unitPrice * (1 - Number(activeTier.discountPct) / 100);
            }
          }
          return total + (unitPrice * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'mechart-cart-storage', // name of the item in the storage (must be unique)
    }
  )
);
