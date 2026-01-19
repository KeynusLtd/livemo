import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  currency?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((x) => x.id === item.id);
        if (existing) {
          set({
            items: get().items.map((x) =>
              x.id === item.id ? { ...x, quantity: x.quantity + quantity } : x
            ),
          });
          return;
        }
        set({ items: [...get().items, { ...item, quantity }] });
      },
      removeItem: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      setQuantity: (id, quantity) =>
        set({
          items: get().items.map((x) => (x.id === id ? { ...x, quantity } : x)),
        }),
      setItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "livemo-marketplace-cart",
      version: 1,
    }
  )
);
