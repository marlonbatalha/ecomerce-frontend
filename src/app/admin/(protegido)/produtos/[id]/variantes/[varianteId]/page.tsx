import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatarDataHora } from "@/features/conta/components/status-do-pedido";
import { historicoEstoqueAdmin, obterProdutoAdmin } from "@/lib/api/admin-catalog";
import { dataUtc } from "@/lib/api/pedidos";
import { formatCurrency } from "@/lib/format";
import { BotaoAtivo } from "../../botao-ativo";
import { AjusteEstoqueForm } from "./ajuste-estoque-form";

export default async function AdminVariantePage(
  props: PageProps<"/admin/produtos/[id]/variantes/[varianteId]">,
) {
  const { id, varianteId } = await props.params;
  const produto = await obterProdutoAdmin(id);
  const variante = produto?.variantes.find((v) => v.id === varianteId);
  if (!produto || !variante) notFound();

  const historico = await historicoEstoqueAdmin(id, varianteId);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Produtos", href: "/admin/produtos" },
          { label: produto.nome, href: `/admin/produtos/${produto.id}` },
          { label: variante.nome },
        ]}
      />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {produto.nome} · {variante.nome}
          </h1>
          <Badge tom={variante.ativo ? "success" : "neutral"}>
            {variante.ativo ? "Ativa" : "Inativa"}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          SKU <span className="font-mono">{variante.sku}</span> ·{" "}
          {formatCurrency(Math.round(variante.preco * 100))} · estoque atual{" "}
          <span className="font-semibold text-foreground tabular-nums">{variante.estoque}</span>
        </p>
        <div className="mt-4">
          <BotaoAtivo
            produtoId={produto.id}
            varianteId={variante.id}
            ativo={variante.ativo}
            rotulo="variante"
          />
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">Ajustar estoque</h2>
          <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
            Vendas já debitam o estoque sozinhas — use isto pra inventário, avaria ou reposição.
          </p>
          <AjusteEstoqueForm
            produtoId={produto.id}
            varianteId={variante.id}
            estoqueAtual={variante.estoque}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Histórico de ajustes</h2>
          {historico.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum ajuste manual ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {historico.map((ajuste) => {
                const diferenca = ajuste.estoqueNovo - ajuste.estoqueAnterior;
                return (
                  <li
                    key={ajuste.id}
                    className="flex items-start justify-between gap-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{ajuste.motivo}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatarDataHora(dataUtc(ajuste.criadoEmUtc))} · {ajuste.estoqueAnterior} →{" "}
                        {ajuste.estoqueNovo}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-semibold tabular-nums ${diferenca >= 0 ? "text-success" : "text-danger"}`}
                    >
                      {diferenca >= 0 ? `+${diferenca}` : diferenca}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
