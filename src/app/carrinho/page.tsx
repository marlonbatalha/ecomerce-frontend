"use client";

import Link from "next/link";
import { CartLineItem } from "@/features/cart/components/cart-line-item";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";
import { cartSubtotalInCents, useCartStore } from "@/features/cart/store";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useHasCartHydrated();

  if (!hasHydrated) {
    // Evita mostrar "carrinho vazio" por um instante antes de hidratar
    // o que estava salvo no localStorage.
    return <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Seu carrinho está vazio
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Que tal dar uma olhada nos nossos produtos?
        </p>
        <Link
          href="/produtos"
          className="mt-6 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotalInCents(items);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Seu carrinho
      </h1>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((item) => (
          <CartLineItem key={item.productId} item={item} />
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Subtotal</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(subtotal)}
          </p>
        </div>
        <Link
          href="/checkout/identificacao"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          Ir para o checkout
        </Link>
      </div>
    </div>
  );
}
