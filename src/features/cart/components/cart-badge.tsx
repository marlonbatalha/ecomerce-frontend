"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon } from "@/components/icons";
import {
  avisarCarrinhoAtualizado,
  useQuantidadeNoCarrinho,
} from "@/features/cart/quantidade-no-cabecalho";

export function CartBadge() {
  const count = useQuantidadeNoCarrinho();
  const pathname = usePathname();

  // Login/logout/checkout regravam o cookie e navegam — relê a cada troca de página.
  useEffect(() => avisarCarrinhoAtualizado(), [pathname]);

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
