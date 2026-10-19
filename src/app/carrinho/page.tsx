import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CartIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { CartLineItem } from "@/features/cart/components/cart-line-item";
import { obterCarrinho } from "@/lib/api/carrinho";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Carrinho",
  robots: { index: false },
};

/** Carrinho vem da API a cada acesso (preço e estoque em tempo real) — nunca do cache. */
export default async function CartPage() {
  const carrinho = await obterCarrinho();

  if (carrinho.itens.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10">
        <EmptyState
          icon={<CartIcon className="h-7 w-7" />}
          title={<span className="text-2xl">Seu carrinho está vazio</span>}
          description="Que tal dar uma olhada nos nossos produtos?"
          action={
            <Link href="/produtos" className={buttonClasses({ tamanho: "lg" })}>
              Ver produtos
            </Link>
          }
        />
      </div>
    );
  }

  // Item esgotado ou acima do estoque faria o checkout falhar na API — bloqueia antes.
  const temPendencia = carrinho.itens.some((i) => i.quantidade > i.estoqueDisponivel);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Seu carrinho"
        description={`${carrinho.quantidadeDeItens} ${carrinho.quantidadeDeItens === 1 ? "item" : "itens"}`}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <Card className="px-5">
          <ul className="divide-y divide-border">
            {carrinho.itens.map((item) => (
              <CartLineItem key={item.varianteId} item={item} />
            ))}
          </ul>
        </Card>

        <Card className="p-6 lg:sticky lg:top-32">
          <h2 className="font-semibold">Resumo</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Frete</dt>
              <dd>Calculado no checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-medium">Subtotal</span>
            <span className="text-xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(carrinho.subtotalInCents)}
            </span>
          </div>

          {temPendencia ? (
            <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              Ajuste os itens marcados pra continuar.
            </p>
          ) : (
            <Link
              href="/checkout"
              className={buttonClasses({ tamanho: "lg", className: "mt-6 w-full" })}
            >
              Ir para o checkout
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/produtos"
            className="mt-3 block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Continuar comprando
          </Link>
        </Card>
      </div>
    </div>
  );
}
