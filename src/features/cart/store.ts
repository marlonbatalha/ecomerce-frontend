import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import type { ProductListItem } from "@/types/catalog";

type CartState = {
  items: CartItem[];
  addItem: (product: ProductListItem, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

/**
 * Carrinho do visitante (sem conta/login — isso é Fase 3). Persistido em
 * localStorage para sobreviver a reloads e fechar/abrir o navegador; ver
 * `useHasCartHydrated` para o hook que evita mismatch de hidratação no SSR.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
          return;
        }

        set({
          items: [
            ...items,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceInCents: product.priceInCents,
              imageUrl: product.imageUrl,
              imageAlt: product.imageAlt,
              quantity,
            },
          ],
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    { name: "ecomerce-cart" },
  ),
);

export { cartItemCount, cartSubtotalInCents } from "@/features/cart/selectors";
