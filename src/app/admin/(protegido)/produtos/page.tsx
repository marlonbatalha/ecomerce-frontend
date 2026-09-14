import Link from "next/link";
import { getCategories } from "@/lib/api/catalog";
import { listarProdutosAdmin } from "@/lib/api/admin-catalog";
import { formatCurrency } from "@/lib/format";

export default async function AdminProdutosPage() {
  const [produtos, categorias] = await Promise.all([listarProdutosAdmin(), getCategories()]);
  const nomeDaCategoria = new Map(categorias.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Produtos
        </h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-500 dark:text-zinc-400">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 font-medium">Categoria</th>
              <th className="py-2 pr-4 font-medium">Preço</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/produtos/${produto.id}`}
                    className="text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {produto.nome}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{produto.sku}</td>
                <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                  {nomeDaCategoria.get(produto.categoriaId) ?? "—"}
                </td>
                <td className="py-3 pr-4">{formatCurrency(Math.round(produto.preco * 100))}</td>
                <td className="py-3">{produto.ativo ? "Ativo" : "Inativo"}</td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  Nenhum produto ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
