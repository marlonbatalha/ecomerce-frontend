import { TagIcon } from "@/components/icons";
import { Card, EmptyState, PageHeader } from "@/components/ui/card";
import { getCategories } from "@/lib/api/catalog";
import { CategoriaForm } from "./categoria-form";

export default async function AdminCategoriasPage() {
  const categorias = await getCategories();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Categorias" description="Organize o catálogo da loja." />

      <Card className="p-6">
        <CategoriaForm />
      </Card>

      <Card className="mt-6 overflow-hidden">
        {categorias.length === 0 ? (
          <EmptyState icon={<TagIcon className="h-7 w-7" />} title="Nenhuma categoria ainda" />
        ) : (
          <ul className="divide-y divide-border">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="font-medium">{categoria.name}</span>
                <span className="font-mono text-xs text-muted-foreground">/{categoria.slug}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
