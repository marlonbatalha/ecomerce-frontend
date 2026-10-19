"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CartIcon, CheckIcon } from "@/components/icons";
import { Aviso } from "@/components/ui/aviso";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { avisarCarrinhoAtualizado } from "@/features/cart/quantidade-no-cabecalho";
import { adicionarAoCarrinho } from "@/lib/api/carrinho-acoes";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Product, ProductVariant } from "@/types/catalog";

/** Abaixo disso o estoque aparece como "Últimas N unidades". */
const ESTOQUE_BAIXO = 5;

function primeiraDisponivel(variants: ProductVariant[]): ProductVariant | undefined {
  return variants.find((v) => v.stock > 0) ?? variants[0];
}

/**
 * Preço, disponibilidade, escolha de variante e "adicionar ao carrinho" da página de produto.
 * Fica tudo num componente só porque preço e estoque mudam conforme a variante escolhida.
 */
export function AddToCartForm({ product }: { product: Product }) {
  const [variant, setVariant] = useState(() => primeiraDisponivel(product.variants));
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [erro, setErro] = useState<string>();
  const [adicionando, iniciarAdicao] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const temEscolha = product.variants.length > 1;
  const disponivel = !!variant && variant.stock > 0;
  const preco = variant?.priceInCents ?? product.priceInCents;

  function escolher(proxima: ProductVariant) {
    setVariant(proxima);
    setQuantity(1);
    setJustAdded(false);
    setErro(undefined);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(preco)}
        </p>
        {disponivel ? (
          <Badge tom={variant.stock <= ESTOQUE_BAIXO ? "warning" : "success"}>
            {variant.stock <= ESTOQUE_BAIXO
              ? `Últimas ${variant.stock} ${variant.stock === 1 ? "unidade" : "unidades"}`
              : "Em estoque"}
          </Badge>
        ) : (
          <Badge tom="danger">Esgotado</Badge>
        )}
      </div>

      {temEscolha && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-medium">
            Opção: <span className="text-muted-foreground">{variant?.name}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((opcao) => {
              const selecionada = opcao.id === variant?.id;
              const esgotada = opcao.stock <= 0;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  aria-pressed={selecionada}
                  aria-label={`${opcao.name}${esgotada ? " (esgotado)" : ""}`}
                  onClick={() => escolher(opcao)}
                  className={cn(
                    "min-w-12 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                    selecionada
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border-strong bg-surface hover:border-foreground/40",
                    esgotada && "text-muted-foreground line-through decoration-1",
                  )}
                >
                  {opcao.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {disponivel ? (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={quantity}
            max={Math.min(99, variant.stock)}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrement={() => setQuantity((q) => Math.min(variant.stock, q + 1))}
          />

          <Button
            tamanho="lg"
            className="min-w-[14rem] flex-1"
            disabled={adicionando}
            onClick={() =>
              iniciarAdicao(async () => {
                setErro(undefined);
                const resultado = await adicionarAoCarrinho(variant.id, quantity);
                if (!resultado.ok) {
                  setErro(resultado.erro);
                  return;
                }
                avisarCarrinhoAtualizado();
                setQuantity(1);
                setJustAdded(true);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setJustAdded(false), 2500);
              })
            }
          >
            {adicionando ? (
              "Adicionando..."
            ) : justAdded ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Adicionado ✓
              </>
            ) : (
              <>
                <CartIcon className="h-4 w-4" />
                Adicionar ao carrinho
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button disabled tamanho="lg" variante="outline" className="mt-8 w-full">
          {temEscolha ? "Opção esgotada" : "Produto esgotado"}
        </Button>
      )}

      <Aviso tom="erro" className="mt-3">
        {erro}
      </Aviso>

      {justAdded && (
        <p
          role="status"
          className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-success-soft px-4 py-3 text-sm text-success"
        >
          <span className="font-medium">Produto adicionado ao carrinho.</span>
          <Link
            href="/carrinho"
            className={buttonClasses({
              variante: "ghost",
              tamanho: "sm",
              className: "text-success hover:bg-success/10 hover:text-success",
            })}
          >
            Ver carrinho
          </Link>
        </p>
      )}
    </div>
  );
}
