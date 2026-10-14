"use client";

import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { cartItemCount, useCartStore } from "@/features/cart/store";
import { useHasCartHydrated } from "@/features/cart/hooks/use-hydrated";

export function CartBadge() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useHasCartHydrated();
  const count = hasHydrated ? cartItemCount(items) : 0;

  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho${count > 0 ? `, ${count} ${count === 1 ? "item" : "itens"}` : ""}`}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <CartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground tabular-nums ring-2 ring-background">
          {count}
        </span>
      )}
    </Link>
  );
}
