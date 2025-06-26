import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item) => {
        set((state) => {
          const existing = state.items.find(i => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      incrementQuantity: (productId) => {
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }));
      },
      decrementQuantity: (productId) => {
        set((state) => {
          const item = state.items.find(i => i.productId === productId);
          if (item && item.quantity > 1) {
            return {
              items: state.items.map(i =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              ),
            };
          } else {
            return {
              items: state.items.filter(i => i.productId !== productId),
            };
          }
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 