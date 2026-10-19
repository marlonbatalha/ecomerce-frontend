import { TagIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { formatarData } from "@/features/conta/components/status-do-pedido";
import { alternarCupomAdmin, listarCuponsAdmin, type CupomAdmin } from "@/lib/api/admin-vendas";
import { formatCurrency } from "@/lib/format";
import { CupomForm } from "./cupom-form";

function desconto(cupom: CupomAdmin): string {
  return cupom.tipo === "Percentual" ? `${cupom.valor}%` : formatCurrency(cupom.valor);
}

/** Ativo no cadastro, mas vencido ou esgotado, não funciona no checkout — mostra isso. */
function situacao(cupom: CupomAdmin): { rotulo: string; tom: "success" | "neutral" | "warning" } {
  if (!cupom.ativo) return { rotulo: "Inativo", tom: "neutral" };
  if (cupom.validoAte && cupom.validoAte.getTime() < Date.now())
    return { rotulo: "Vencido", tom: "warning" };
  if (cupom.limiteDeUsos !== undefined && cupom.quantidadeDeUsos >= cupom.limiteDeUsos) {
    return { rotulo: "Esgotado", tom: "warning" };
  }
  return { rotulo: "Ativo", tom: "success" };
}

export default async function AdminCuponsPage() {
  const cupons = await listarCuponsAdmin();

  return (
    <div>
      <PageHeader
        title="Cupons"
        description="Descontos aplicados no checkout (só sobre os produtos, não o frete)."
      />

      {cupons.length === 0 ? (
        <EmptyState icon={<TagIcon className="h-7 w-7" />} title="Nenhum cupom ainda" />
      ) : (
        <div className="mb-10 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Código</th>
                <th className="px-4 py-2.5 font-medium">Desconto</th>
                <th className="px-4 py-2.5 font-medium">Regras</th>
                <th className="px-4 py-2.5 text-right font-medium">Usos</th>
                <th className="px-4 py-2.5 font-medium">Situação</th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cupons.map((cupom) => {
                const { rotulo, tom } = situacao(cupom);
                const regras = [
                  cupom.valorMinimoInCents !== undefined &&
                    `mín. ${formatCurrency(cupom.valorMinimoInCents)}`,
                  cupom.validoAte && `até ${formatarData(cupom.validoAte)}`,
                ].filter(Boolean);
                return (
                  <tr key={cupom.id}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium">{cupom.codigo}</span>
                      {cupom.descricao && (
                        <span className="block text-xs text-muted-foreground">
                          {cupom.descricao}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{desconto(cupom)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{regras.join(" · ") || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {cupom.quantidadeDeUsos}
                      {cupom.limiteDeUsos !== undefined && ` / ${cupom.limiteDeUsos}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tom={tom}>{rotulo}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={alternarCupomAdmin.bind(null, cupom.id, !cupom.ativo)}>
                        <Button type="submit" variante="ghost" tamanho="sm">
                          {cupom.ativo ? "Inativar" : "Ativar"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Novo cupom</h2>
        <CupomForm />
      </Card>
    </div>
  );
}
