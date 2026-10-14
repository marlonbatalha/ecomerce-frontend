import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  AlertIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  StarIcon,
  TrashIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { moverImagemAdmin, obterProdutoAdmin, removerImagemAdmin } from "@/lib/api/admin-catalog";
import { getCategories } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/format";
import { VarianteForm } from "./variante-form";
import { ImagemForm } from "./imagem-form";

const BOTAO_IMAGEM =
  "flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-card backdrop-blur transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-40";

export default async function AdminProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [produto, categorias] = await Promise.all([obterProdutoAdmin(id), getCategories()]);

  if (!produto) notFound();

  const categoria = categorias.find((c) => c.id === produto.categoriaId);
  const disponivel = produto.variantes.some((v) => v.ativo && v.estoque > 0);
  const imagens = [...produto.imagens].sort((a, b) => a.ordem - b.ordem);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Produtos", href: "/admin/produtos" }, { label: produto.nome }]}
      />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{produto.nome}</h1>
          <Badge tom={produto.ativo ? "success" : "neutral"}>
            {produto.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          SKU <span className="font-mono">{produto.sku}</span> ·{" "}
          {categoria?.name ?? "sem categoria"} · {formatCurrency(Math.round(produto.preco * 100))}
        </p>
        {disponivel ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
            <CheckCircleIcon className="h-4 w-4" />
            Aparece na loja
          </p>
        ) : (
          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
            <AlertIcon className="h-4 w-4 shrink-0" />
            Ainda não aparece na loja — precisa de uma variante ativa com estoque
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">Variantes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tamanhos, cores ou versões com estoque próprio.
          </p>

          {produto.variantes.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Nome</th>
                    <th className="px-4 py-2.5 font-medium">SKU</th>
                    <th className="px-4 py-2.5 text-right font-medium">Preço</th>
                    <th className="px-4 py-2.5 text-right font-medium">Estoque</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {produto.variantes.map((variante) => (
                    <tr key={variante.id}>
                      <td className="px-4 py-2.5 font-medium">{variante.nome}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {variante.sku}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {formatCurrency(Math.round(variante.preco * 100))}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span className={variante.estoque === 0 ? "text-danger" : undefined}>
                          {variante.estoque}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge tom={variante.ativo ? "success" : "neutral"}>
                          {variante.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-semibold">Nova variante</h3>
            <VarianteForm produtoId={produto.id} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Imagens</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A primeira é a principal, usada na vitrine da loja.
          </p>

          {imagens.length > 0 ? (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imagens.map((imagem, indice) => (
                <li
                  key={imagem.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted"
                >
                  <Image
                    src={imagem.url}
                    alt={`Imagem ${indice + 1} de ${produto.nome}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  {indice === 0 && (
                    <Badge tom="accent" className="absolute top-2 left-2 shadow-card">
                      <StarIcon className="h-3 w-3" />
                      Principal
                    </Badge>
                  )}

                  {/* Sempre visível no toque; no desktop aparece no hover/foco. */}
                  <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                    <div className="flex gap-1">
                      <form action={moverImagemAdmin.bind(null, produto.id, imagem.id, "anterior")}>
                        <button
                          type="submit"
                          disabled={indice === 0}
                          aria-label={`Mover imagem ${indice + 1} para a esquerda`}
                          className={BOTAO_IMAGEM}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={moverImagemAdmin.bind(null, produto.id, imagem.id, "proxima")}>
                        <button
                          type="submit"
                          disabled={indice === imagens.length - 1}
                          aria-label={`Mover imagem ${indice + 1} para a direita`}
                          className={BOTAO_IMAGEM}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </form>
                      {indice > 0 && (
                        <form
                          action={moverImagemAdmin.bind(null, produto.id, imagem.id, "principal")}
                        >
                          <button
                            type="submit"
                            aria-label={`Definir imagem ${indice + 1} como principal`}
                            className={BOTAO_IMAGEM}
                          >
                            <StarIcon className="h-4 w-4" />
                          </button>
                        </form>
                      )}
                    </div>
                    <form action={removerImagemAdmin.bind(null, produto.id, imagem.id)}>
                      <button
                        type="submit"
                        aria-label={`Remover imagem ${indice + 1}`}
                        className={`${BOTAO_IMAGEM} hover:bg-danger hover:text-white`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border-strong px-4 py-10 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma imagem ainda.</p>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-6">
            <ImagemForm produtoId={produto.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}
