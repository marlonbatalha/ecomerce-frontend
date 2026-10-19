import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPinIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/card";
import { FormularioEndereco } from "@/features/conta/components/formulario-endereco";
import { FormularioCheckout } from "@/features/checkout/components/formulario-checkout";
import { calcularFrete, obterCarrinho } from "@/lib/api/carrinho";
import { listarEnderecos } from "@/lib/api/conta";
import { exigirSessao } from "@/lib/auth/sessao";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

/**
 * Checkout numa página só: endereço (salvo na conta, ou um novo ali mesmo), frete calculado pelo
 * CEP do endereço escolhido, cupom e resumo. Exige login — a API só finaliza compra de usuário
 * autenticado; o carrinho anônimo já foi mesclado no da conta durante o login.
 */
export default async function CheckoutPage(props: PageProps<"/checkout">) {
  const { endereco: enderecoParam, novo } = await props.searchParams;
  const sessao = await exigirSessao("/checkout");
  const [carrinho, enderecos] = await Promise.all([obterCarrinho(), listarEnderecos(sessao)]);

  // Carrinho vazio, ou com item esgotado/acima do estoque: o carrinho mostra o que ajustar.
  if (
    carrinho.itens.length === 0 ||
    carrinho.itens.some((i) => i.quantidade > i.estoqueDisponivel)
  ) {
    redirect("/carrinho");
  }

  const escolhido =
    enderecos.find((e) => e.id === enderecoParam) ??
    enderecos.find((e) => e.padrao) ??
    enderecos[0];
  const cadastrando = enderecos.length === 0 || novo === "1";
  const fretes = escolhido && !cadastrando ? await calcularFrete(escolhido.cep, carrinho) : [];

  return (
    <>
      <PageHeader title="Finalizar compra" />

      <Card className="mb-6 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-semibold">1. Endereço de entrega</h2>
          {!cadastrando && (
            <Link
              href="/checkout?novo=1"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              + Novo endereço
            </Link>
          )}
        </div>

        {cadastrando ? (
          <>
            <FormularioEndereco noCheckout />
            {enderecos.length > 0 && (
              <Link
                href="/checkout"
                className={buttonClasses({ variante: "ghost", className: "mt-3" })}
              >
                Usar um endereço salvo
              </Link>
            )}
          </>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2" aria-label="Endereços salvos">
            {enderecos.map((endereco) => {
              const selecionado = endereco.id === escolhido?.id;
              return (
                <li key={endereco.id}>
                  <Link
                    href={`/checkout?endereco=${endereco.id}`}
                    aria-current={selecionado ? "true" : undefined}
                    scroll={false}
                    className={cn(
                      "flex h-full gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                      selecionado
                        ? "border-primary bg-surface-muted"
                        : "border-border hover:border-border-strong",
                    )}
                  >
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="block font-medium">{endereco.rotulo}</span>
                      <span className="block text-muted-foreground">
                        {endereco.logradouro}, {endereco.numero}
                        {endereco.complemento && ` — ${endereco.complemento}`}
                        <br />
                        {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <FormularioCheckout
        key={escolhido?.id ?? "sem-endereco"}
        enderecoId={cadastrando ? undefined : escolhido?.id}
        fretes={fretes}
        carrinho={carrinho}
      />
    </>
  );
}
