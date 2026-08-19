"use client";

import Link from "next/link";
import { TrashIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { useCartStore } from "@/features/cart/store";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex gap-4 py-4">
      <Link
        href={`/produtos/${item.slug}`}
        className="relative h-20 w-20 shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-900"
      >
        <ProductImage src={item.imageUrl} alt={item.imageAlt} className="object-contain p-2" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/produtos/${item.slug}`}
            className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
          >
            {item.name}
          </Link>
          <button
            type="button"
            aria-label={`Remover ${item.name} do carrinho`}
            onClick={() => removeItem(item.productId)}
            className="shrink-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
            <button
              type="button"
              aria-label={`Diminuir quantidade de ${item.name}`}
              onClick={() => setQuantity(item.productId, item.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Aumentar quantidade de ${item.name}`}
              onClick={() => setQuantity(item.productId, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              +
            </button>
          </div>

          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(item.priceInCents * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
