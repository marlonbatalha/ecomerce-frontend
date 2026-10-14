"use client";

import Link from "next/link";
import { TrashIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCartStore } from "@/features/cart/store";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/produtos/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
      >
        <ProductImage
          src={item.imageUrl}
          alt={item.imageAlt}
          className="object-contain p-2.5"
          sizes="96px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/produtos/${item.slug}`}
              className="line-clamp-2 text-sm font-medium transition-colors hover:text-accent"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {formatCurrency(item.priceInCents)} cada
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remover ${item.name} do carrinho`}
            onClick={() => removeItem(item.productId)}
            className="-m-1.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            size="sm"
            min={0}
            value={item.quantity}
            label={`de ${item.name}`}
            onDecrement={() => setQuantity(item.productId, item.quantity - 1)}
            onIncrement={() => setQuantity(item.productId, item.quantity + 1)}
          />
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(item.priceInCents * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
