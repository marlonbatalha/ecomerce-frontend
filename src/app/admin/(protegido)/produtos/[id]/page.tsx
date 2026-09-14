import Image from "next/image";
import { notFound } from "next/navigation";
import { obterProdutoAdmin } from "@/lib/api/admin-catalog";
import { getCategories } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/format";
import { VarianteForm } from "./variante-form";
import { ImagemForm } from "./imagem-form";

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

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {produto.nome}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        SKU {produto.sku} · {categoria?.name ?? "sem categoria"} ·{" "}
        {formatCurrency(Math.round(produto.preco * 100))}
      </p>
      <p className="mt-1 text-sm">
        {disponivel ? (
          <span className="text-green-700 dark:text-green-500">Aparece na loja</span>
        ) : (
          <span className="text-amber-700 dark:text-amber-500">
            Ainda não aparece na loja — precisa de uma variante ativa com estoque
          </span>
        )}
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-50">Variantes</h2>

        {produto.variantes.length > 0 && (
          <table className="mb-6 w-full text-left text-sm">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Nome</th>
                <th className="py-2 pr-4 font-medium">SKU</th>
                <th className="py-2 pr-4 font-medium">Preço</th>
                <th className="py-2 pr-4 font-medium">Estoque</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {produto.variantes.map((variante) => (
                <tr key={variante.id}>
                  <td className="py-2 pr-4">{variante.nome}</td>
                  <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">{variante.sku}</td>
                  <td className="py-2 pr-4">{formatCurrency(Math.round(variante.preco * 100))}</td>
                  <td className="py-2 pr-4">{variante.estoque}</td>
                  <td className="py-2">{variante.ativo ? "Ativa" : "Inativa"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <VarianteForm produtoId={produto.id} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-50">Imagens</h2>

        {produto.imagens.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {produto.imagens.map((imagem) => (
              <div
                key={imagem.id}
                className="relative h-24 w-24 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900"
              >
                <Image src={imagem.url} alt="" fill sizes="96px" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <ImagemForm produtoId={produto.id} />
      </section>
    </div>
  );
}
