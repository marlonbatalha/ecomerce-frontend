import type { CartItem } from "@/types/cart";

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotalInCents(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
}
