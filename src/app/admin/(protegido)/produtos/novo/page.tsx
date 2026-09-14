import { getCategories } from "@/lib/api/catalog";
import { ProdutoForm } from "./produto-form";

export default async function AdminNovoProdutoPage() {
  const categorias = await getCategories();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Novo produto
      </h1>
      {categorias.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Crie uma categoria antes de cadastrar um produto.
        </p>
      ) : (
        <ProdutoForm categorias={categorias} />
      )}
    </div>
  );
}
