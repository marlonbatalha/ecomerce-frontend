import { getCategories } from "@/lib/api/catalog";
import { CategoriaForm } from "./categoria-form";

export default async function AdminCategoriasPage() {
  const categorias = await getCategories();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Categorias
      </h1>

      <CategoriaForm />

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {categorias.map((categoria) => (
          <li key={categoria.id} className="flex items-center justify-between py-3">
            <span className="text-zinc-900 dark:text-zinc-50">{categoria.name}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">/{categoria.slug}</span>
          </li>
        ))}
        {categorias.length === 0 && (
          <li className="py-3 text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma categoria ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
