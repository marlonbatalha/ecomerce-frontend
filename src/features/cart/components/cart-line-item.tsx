"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { TrashIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { avisarCarrinhoAtualizado } from "@/features/cart/quantidade-no-cabecalho";
import {
  alterarQuantidade,
  removerDoCarrinho,
  type ResultadoDoCarrinho,
} from "@/lib/api/carrinho-acoes";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { ItemDoCarrinho } from "@/types/carrinho";

export function CartLineItem({ item }: { item: ItemDoCarrinho }) {
  const [salvando, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();

  const esgotado = item.estoqueDisponivel <= 0;
  const acimaDoEstoque = !esgotado && item.quantidade > item.estoqueDisponivel;

  // A página re-renderiza sozinha (revalidatePath na action); aqui só o erro e o ícone.
  function executar(acao: () => Promise<ResultadoDoCarrinho>) {
    iniciar(async () => {
      setErro(undefined);
      const resultado = await acao();
      if (!resultado.ok) setErro(resultado.erro);
      else avisarCarrinhoAtualizado();
    });
  }

  return (
    <li className={cn("flex gap-4 py-5 transition-opacity", salvando && "opacity-60")}>
      <Link
        href={`/produtos/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted"
      >
        <ProductImage
          src={item.imagemUrl}
          alt={item.nomeProduto}
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
              {item.nomeProduto}
            </Link>
            {item.nomeVariante && (
              <p className="mt-0.5 text-xs text-muted-foreground">Opção: {item.nomeVariante}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {formatCurrency(item.precoUnitarioInCents)} cada
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remover ${item.nomeProduto} do carrinho`}
            disabled={salvando}
            onClick={() => executar(() => removerDoCarrinho(item.varianteId))}
            className="-m-1.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            size="sm"
            min={0}
            max={Math.max(item.estoqueDisponivel, 0)}
            value={item.quantidade}
            label={`de ${item.nomeProduto}`}
            onDecrement={() =>
              executar(() => alterarQuantidade(item.varianteId, item.quantidade - 1))
            }
            onIncrement={() =>
              executar(() => alterarQuantidade(item.varianteId, item.quantidade + 1))
            }
          />
          <p className="text-sm font-semibold tabular-nums">
            {formatCurrency(item.subtotalInCents)}
          </p>
        </div>

        {(esgotado || acimaDoEstoque || erro) && (
          <p role="alert" className="text-xs font-medium text-danger">
            {erro ??
              (esgotado
                ? "Esgotou — remova do carrinho pra continuar."
                : `Só restam ${item.estoqueDisponivel} — ajuste a quantidade.`)}
          </p>
        )}
      </div>
    </li>
  );
}
