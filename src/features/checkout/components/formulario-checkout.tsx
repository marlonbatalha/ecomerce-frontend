"use client";

import { useActionState, useState, useTransition } from "react";
import { LockIcon, TagIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { Aviso } from "@/components/ui/aviso";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { finalizarCompra, validarCupom } from "@/lib/api/carrinho-acoes";
import type { EstadoDoFormulario } from "@/lib/api/conta-acoes";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { Carrinho, OpcaoDeFrete } from "@/types/carrinho";

const ESTADO_INICIAL: EstadoDoFormulario = {};

type CupomAplicado = { codigo: string; descontoInCents: number };

function prazo(dias: number): string {
  return `${dias} ${dias === 1 ? "dia útil" : "dias úteis"}`;
}

/**
 * Frete, cupom, resumo e finalização. Os valores aqui são prévia: no "Ir para o pagamento" a API
 * recalcula frete e desconto do zero (o que vale é o que ela devolver).
 */
export function FormularioCheckout({
  enderecoId,
  fretes,
  carrinho,
}: {
  enderecoId?: string;
  fretes: OpcaoDeFrete[];
  carrinho: Carrinho;
}) {
  const [estado, acao, enviando] = useActionState(finalizarCompra, ESTADO_INICIAL);
  const [metodo, setMetodo] = useState(() => fretes[0]?.nome);
  const [cupom, setCupom] = useState<CupomAplicado>();
  const [codigoDigitado, setCodigoDigitado] = useState("");
  const [erroCupom, setErroCupom] = useState<string>();
  const [validandoCupom, iniciarValidacao] = useTransition();

  const frete = fretes.find((f) => f.nome === metodo);
  const desconto = cupom?.descontoInCents ?? 0;
  const total = carrinho.subtotalInCents - desconto + (frete?.precoInCents ?? 0);
  const podeFinalizar = !!enderecoId && !!frete && !enviando;

  function aplicarCupom() {
    iniciarValidacao(async () => {
      setErroCupom(undefined);
      const resultado = await validarCupom(codigoDigitado, carrinho.subtotalInCents);
      if (resultado.ok) {
        setCupom({ codigo: resultado.codigo, descontoInCents: resultado.descontoInCents });
        setCodigoDigitado("");
      } else {
        setErroCupom(resultado.erro);
      }
    });
  }

  return (
    <form action={acao} className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <input type="hidden" name="enderecoId" value={enderecoId ?? ""} />
      <input type="hidden" name="metodoDeEnvio" value={metodo ?? ""} />
      <input type="hidden" name="codigoCupom" value={cupom?.codigo ?? ""} />

      <Card className="p-5 sm:p-6">
        <h2 className="font-semibold">2. Forma de envio</h2>
        {!enderecoId ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Cadastre um endereço pra ver as opções de frete.
          </p>
        ) : fretes.length === 0 ? (
          <Aviso tom="erro" className="mt-3">
            Não conseguimos calcular o frete pra este CEP agora. Tente de novo em instantes.
          </Aviso>
        ) : (
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Forma de envio</legend>
            {fretes.map((opcao) => (
              <label
                key={opcao.nome}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  metodo === opcao.nome
                    ? "border-primary bg-surface-muted"
                    : "border-border hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name="opcaoDeEnvio"
                  value={opcao.nome}
                  checked={metodo === opcao.nome}
                  onChange={() => setMetodo(opcao.nome)}
                  className="accent-primary"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{opcao.nome}</span>
                  <span className="block text-xs text-muted-foreground">
                    Chega em até {prazo(opcao.prazoEmDiasUteis)}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(opcao.precoInCents)}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </Card>

      <Card className="p-5 sm:p-6 lg:sticky lg:top-32 lg:row-span-2">
        <h2 className="mb-4 font-semibold">Resumo do pedido</h2>
        <ul className="space-y-3">
          {carrinho.itens.map((item) => (
            <li key={item.varianteId} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                <ProductImage
                  src={item.imagemUrl}
                  alt={item.nomeProduto}
                  className="object-contain p-1"
                  sizes="48px"
                />
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background tabular-nums">
                  {item.quantidade}
                </span>
              </div>
              <p className="min-w-0 flex-1 truncate text-sm">
                {item.nomeProduto}
                {item.nomeVariante && (
                  <span className="text-muted-foreground"> · {item.nomeVariante}</span>
                )}
              </p>
              <p className="shrink-0 text-sm font-medium tabular-nums">
                {formatCurrency(item.subtotalInCents)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-border pt-4">
          {cupom ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
              <span className="flex items-center gap-2 font-medium">
                <TagIcon className="h-4 w-4" />
                {cupom.codigo}
              </span>
              <button
                type="button"
                onClick={() => setCupom(undefined)}
                className="text-xs font-medium underline"
              >
                Remover
              </button>
            </div>
          ) : (
            <div>
              <Label htmlFor="cupom">Cupom de desconto</Label>
              <div className="flex gap-2">
                <Input
                  id="cupom"
                  value={codigoDigitado}
                  onChange={(e) => setCodigoDigitado(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter aqui aplicaria o cupom, não finalizaria a compra.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      aplicarCupom();
                    }
                  }}
                  aria-invalid={erroCupom ? true : undefined}
                  autoCapitalize="characters"
                  placeholder="CÓDIGO"
                />
                <Button
                  type="button"
                  variante="outline"
                  disabled={validandoCupom || !codigoDigitado.trim()}
                  onClick={aplicarCupom}
                >
                  {validandoCupom ? "..." : "Aplicar"}
                </Button>
              </div>
              {erroCupom && <p className="mt-1.5 text-xs font-medium text-danger">{erroCupom}</p>}
            </div>
          )}
        </div>

        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatCurrency(carrinho.subtotalInCents)}</dd>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-success">
              <dt>Desconto</dt>
              <dd className="tabular-nums">−{formatCurrency(desconto)}</dd>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <dt>Frete{frete && ` (${frete.nome})`}</dt>
            <dd className="tabular-nums">{frete ? formatCurrency(frete.precoInCents) : "—"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(total)}</dd>
          </div>
        </dl>

        <Aviso tom="erro" className="mt-4">
          {estado.erro}
        </Aviso>

        <Button type="submit" tamanho="lg" disabled={!podeFinalizar} className="mt-5 w-full gap-2">
          <LockIcon className="h-4 w-4" />
          {enviando ? "Criando pedido..." : "Ir para o pagamento"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Você paga no Mercado Pago com Pix, cartão ou boleto. Nenhum dado de pagamento passa pela
          loja.
        </p>
      </Card>
    </form>
  );
}
