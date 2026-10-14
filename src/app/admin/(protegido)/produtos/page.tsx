import Link from "next/link";
import { PackageIcon, PlusIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { getCategories } from "@/lib/api/catalog";
import { listarProdutosAdmin } from "@/lib/api/admin-catalog";
import { formatCurrency } from "@/lib/format";

export default async function AdminProdutosPage() {
  const [produtos, categorias] = await Promise.all([listarProdutosAdmin(), getCategories()]);
  const nomeDaCategoria = new Map(categorias.map((c) => [c.id, c.name]));

  return (
    <div>
      <PageHeader
        title="Produtos"
        description={`${produtos.length} ${produtos.length === 1 ? "produto cadastrado" : "produtos cadastrados"}`}
        actions={
          <Link href="/admin/produtos/novo" className={buttonClasses()}>
            <PlusIcon className="h-4 w-4" />
            Novo produto
          </Link>
        }
      />

      {produtos.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PackageIcon className="h-7 w-7" />}
            title="Nenhum produto ainda"
            description="Cadastre o primeiro produto para ele aparecer aqui."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 text-right font-medium">Preço</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {produtos.map((produto) => (
                  <tr key={produto.id} className="transition-colors hover:bg-surface-muted/50">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/produtos/${produto.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {produto.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {produto.sku}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {nomeDaCategoria.get(produto.categoriaId) ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {formatCurrency(Math.round(produto.preco * 100))}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tom={produto.ativo ? "success" : "neutral"}>
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
