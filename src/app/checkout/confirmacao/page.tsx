import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertIcon, CheckCircleIcon, PackageIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { numeroDoPedido } from "@/features/conta/components/status-do-pedido";
import { ResumoDoPedido } from "@/features/conta/components/resumo-do-pedido";
import { obterPedido } from "@/lib/api/conta";
import { exigirSessao } from "@/lib/auth/sessao";
import { cn } from "@/lib/cn";
import type { Pedido } from "@/types/conta";

export const metadata: Metadata = {
  title: "Pedido recebido",
  robots: { index: false },
};

type Situacao = { titulo: string; texto: string; tom: "sucesso" | "aguardando" | "falha" };

/**
 * O status que vale é o do pedido na API (atualizado pelo webhook do Mercado Pago). O `status` que
 * o Mercado Pago põe na URL de retorno só ajuda a explicar o intervalo até o webhook chegar —
 * nunca confirma pagamento sozinho (é só um parâmetro de URL, qualquer um edita).
 */
function situacao(pedido: Pedido, statusNoRetorno: string | undefined): Situacao {
  switch (pedido.status) {
    case "PagamentoConfirmado":
    case "Enviado":
    case "Entregue":
      return {
        titulo: "Pagamento confirmado!",
        texto: "Já estamos separando seu pedido.",
        tom: "sucesso",
      };
    case "PagamentoRecusado":
      return {
        titulo: "Pagamento não aprovado",
        texto:
          "O Mercado Pago recusou o pagamento. Os itens voltaram ao estoque — você pode montar o pedido de novo.",
        tom: "falha",
      };
    case "Cancelado":
    case "Reembolsado":
      return {
        titulo: "Pedido cancelado",
        texto: "Este pedido não está mais ativo.",
        tom: "falha",
      };
    case "Pendente":
      if (statusNoRetorno === "approved") {
        return {
          titulo: "Pagamento recebido",
          texto:
            "Estamos aguardando a confirmação do Mercado Pago — leva poucos instantes. Você recebe um e-mail quando confirmar.",
          tom: "aguardando",
        };
      }
      if (statusNoRetorno === "rejected" || statusNoRetorno === "failure") {
        return {
          titulo: "O pagamento não foi concluído",
          texto: "Seu pedido continua reservado. Tente pagar de novo pelo botão abaixo.",
          tom: "falha",
        };
      }
      return {
        titulo: "Pedido recebido!",
        texto: pedido.urlPagamento
          ? "Falta só o pagamento. Pix e boleto podem levar alguns minutos pra compensar."
          : "Assim que o pagamento for confirmado, você recebe um e-mail.",
        tom: "aguardando",
      };
  }
}

export default async function ConfirmacaoPage(props: PageProps<"/checkout/confirmacao">) {
  const {
    pedido: pedidoId,
    status,
    collection_status: statusDaCobranca,
  } = await props.searchParams;
  if (typeof pedidoId !== "string") notFound();

  const sessao = await exigirSessao(`/checkout/confirmacao?pedido=${encodeURIComponent(pedidoId)}`);
  const pedido = await obterPedido(sessao, pedidoId);
  if (!pedido) notFound();

  const statusNoRetorno = [status, statusDaCobranca].find(
    (s): s is string => typeof s === "string",
  );
  const { titulo, texto, tom } = situacao(pedido, statusNoRetorno);
  const Icone = tom === "sucesso" ? CheckCircleIcon : tom === "falha" ? AlertIcon : PackageIcon;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <span
          className={cn(
            "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl",
            tom === "sucesso" && "bg-success-soft text-success",
            tom === "aguardando" && "bg-accent-soft text-accent",
            tom === "falha" && "bg-danger-soft text-danger",
          )}
        >
          <Icone className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</h1>
        <p className="mt-2 text-muted-foreground">
          Pedido{" "}
          <span className="font-medium text-foreground tabular-nums">
            {numeroDoPedido(pedido.id)}
          </span>
        </p>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">{texto}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {pedido.status === "Pendente" && pedido.urlPagamento && (
            <a href={pedido.urlPagamento} className={buttonClasses({ tamanho: "lg" })}>
              Pagar agora
            </a>
          )}
          <Link
            href={`/conta/pedidos/${pedido.id}`}
            className={buttonClasses({ variante: "outline", tamanho: "lg" })}
          >
            Ver pedido
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <ResumoDoPedido pedido={pedido} />
      </div>

      <p className="mt-8 text-center">
        <Link href="/produtos" className="text-sm font-medium text-accent hover:text-accent-hover">
          Continuar comprando
        </Link>
      </p>
    </div>
  );
}
